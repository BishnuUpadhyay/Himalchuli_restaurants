import { createServerFn } from "@tanstack/react-start";
import { bookingSchema, waitlistSchema } from "./reservations.shared";
import type { BookingConfirmation, TableLocation, TimeSlot } from "./reservations.shared";

export const getBookingConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { loadSettings } = await import("./reservation-engine.server");
  const s = await loadSettings();
  return {
    openingHours: s.opening_hours,
    maxPartySize: s.max_party_size,
    advanceBookingDays: s.advance_booking_days,
    durationMinutes: s.default_duration_minutes,
    cancellationPolicy: s.cancellation_policy,
  };
});

export const getAvailability = createServerFn({ method: "POST" })
  .inputValidator((input: { date: string; guestCount: number; location?: string | null }) => input)
  .handler(async ({ data }): Promise<{ slots: TimeSlot[]; closed: boolean; note?: string }> => {
    const { buildAvailability } = await import("./reservation-engine.server");
    return buildAvailability(
      data.date,
      Math.min(Math.max(data.guestCount, 1), 30),
      (data.location as TableLocation | null) ?? null,
    );
  });

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => bookingSchema.parse(input))
  .handler(async ({ data }): Promise<BookingConfirmation> => {
    const engine = await import("./reservation-engine.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const settings = await engine.loadSettings();
    if (data.guestCount > settings.max_party_size) {
      throw new Error(
        `For parties larger than ${settings.max_party_size}, please call the restaurant directly.`,
      );
    }

    const start = engine.localToUtc(data.date, data.time);
    if (start.getTime() < Date.now()) throw new Error("That time has already passed.");

    const [tables, reservations] = await Promise.all([
      engine.loadTables(),
      engine.loadDayReservations(data.date),
    ]);
    const links = await engine.loadReservationTableLinks(reservations.map((r) => r.id));
    const busy = engine.busyTableIds(
      reservations,
      start,
      settings.default_duration_minutes,
      settings.buffer_minutes,
      links,
    );

    const assignment = engine.pickBestTable(
      tables,
      busy,
      data.guestCount,
      (data.preferredLocation as TableLocation | null) ?? null,
    );
    if (!assignment) {
      throw new Error("Sorry, that time was just taken. Please pick another time or join the waitlist.");
    }

    const customerId = await engine.upsertCustomer({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      preferredLocation: data.preferredLocation ?? null,
    });

    const bookingCode = engine.generateBookingCode();
    const status = settings.auto_confirm ? "confirmed" : "pending";

    const { data: reservation, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        booking_code: bookingCode,
        restaurant_id: engine.RESTAURANT_ID,
        customer_id: customerId,
        table_id: assignment.tableIds[0],
        guest_count: data.guestCount,
        reserved_at: start.toISOString(),
        duration_minutes: settings.default_duration_minutes,
        buffer_minutes: settings.buffer_minutes,
        status,
        source: "online",
        preferred_location: data.preferredLocation ?? null,
        occasion: data.occasion,
        special_request: data.specialRequest || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    if (assignment.tableIds.length > 1) {
      await supabaseAdmin.from("reservation_tables").insert(
        assignment.tableIds.map((tableId) => ({
          reservation_id: reservation.id,
          table_id: tableId,
        })),
      );
    }

    const timeLabel = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    }).format(start);

    const summary = `Reservation ${bookingCode} for ${data.guestCount} guest(s) on ${data.date} at ${timeLabel}. Table ${assignment.label}.`;

    await engine.queueNotification({
      reservationId: reservation.id,
      channel: "email",
      type: "booking_confirmation",
      recipient: data.email,
      subject: `Your reservation at Himalchuli — ${bookingCode}`,
      body: summary,
    });
    await engine.queueNotification({
      reservationId: reservation.id,
      channel: "sms",
      type: "booking_confirmation",
      recipient: data.phone,
      body: summary,
    });
    await engine.queueNotification({
      reservationId: reservation.id,
      channel: "email",
      type: "reminder",
      recipient: data.email,
      subject: "Reminder: your table at Himalchuli tomorrow",
      body: summary,
      scheduledFor: new Date(start.getTime() - 24 * 60 * 60 * 1000),
    });

    await engine.logAudit({
      action: "reservation.created",
      entity: "reservation",
      entityId: reservation.id,
      actorLabel: data.fullName,
      details: { source: "online", bookingCode },
    });

    return {
      bookingCode,
      date: data.date,
      time: data.time,
      timeLabel,
      guestCount: data.guestCount,
      tableLabel: assignment.label,
      status,
      durationMinutes: settings.default_duration_minutes,
    };
  });

export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => waitlistSchema.parse(input))
  .handler(async ({ data }) => {
    const engine = await import("./reservation-engine.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const preferred = engine.localToUtc(data.date, data.time);
    const { error } = await supabaseAdmin.from("waitlist").insert({
      restaurant_id: engine.RESTAURANT_ID,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email || null,
      guest_count: data.guestCount,
      preferred_time: preferred.toISOString(),
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const lookupReservation = createServerFn({ method: "POST" })
  .inputValidator((input: { bookingCode: string; phone: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { utcToLocalParts } = await import("./reservation-engine.server");
    const { data: row } = await supabaseAdmin
      .from("reservations")
      .select("id, booking_code, guest_count, reserved_at, status, customer_phone, customer_name")
      .eq("booking_code", data.bookingCode.trim().toUpperCase())
      .maybeSingle();
    if (!row || row.customer_phone.replace(/\D/g, "") !== data.phone.replace(/\D/g, "")) {
      return null;
    }
    const parts = utcToLocalParts(row.reserved_at);
    return {
      id: row.id,
      bookingCode: row.booking_code,
      guestCount: row.guest_count,
      status: row.status,
      name: row.customer_name,
      date: parts.date,
      time: parts.time,
    };
  });

export const cancelReservationByCode = createServerFn({ method: "POST" })
  .inputValidator((input: { bookingCode: string; phone: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");
    const { data: row } = await supabaseAdmin
      .from("reservations")
      .select("id, customer_phone, customer_email, booking_code, status")
      .eq("booking_code", data.bookingCode.trim().toUpperCase())
      .maybeSingle();
    if (!row || row.customer_phone.replace(/\D/g, "") !== data.phone.replace(/\D/g, "")) {
      throw new Error("We couldn't find that reservation.");
    }
    await supabaseAdmin
      .from("reservations")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", row.id);
    if (row.customer_email) {
      await engine.queueNotification({
        reservationId: row.id,
        channel: "email",
        type: "cancellation",
        recipient: row.customer_email,
        subject: `Reservation ${row.booking_code} cancelled`,
        body: `Your reservation ${row.booking_code} has been cancelled.`,
      });
    }
    await engine.logAudit({
      action: "reservation.cancelled",
      entity: "reservation",
      entityId: row.id,
      actorLabel: "guest",
    });
    return { ok: true };
  });
