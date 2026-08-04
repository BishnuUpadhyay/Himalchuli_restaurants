import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const RESTAURANT = "11111111-1111-4111-8111-111111111111";

// Best-effort absolute origin for building email redirect links (invite / reset password).
// Falls back to an env var for background jobs where there's no inbound request.
function siteOrigin(): string | undefined {
  try {
    const req = getRequest();
    const origin = req?.headers.get("origin");
    if (origin) return origin;
    const referer = req?.headers.get("referer");
    if (referer) return new URL(referer).origin;
  } catch {
    // no request context available
  }
  return process.env.SITE_URL;
}

/* ------------------------------------------------------------------ access */

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRole } = await import("./admin.server");

    let role = await getRole(context.userId);

    if (!role) {
      // Bootstrap: the very first staff account to sign in becomes the owner.
      const { count } = await supabaseAdmin
        .from("user_roles")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) === 0) {
        const email = (context.claims.email as string | undefined) ?? null;
        await supabaseAdmin.from("user_roles").insert({ user_id: context.userId, role: "owner" });
        await supabaseAdmin.from("staff_members").insert({
          user_id: context.userId,
          restaurant_id: RESTAURANT,
          email,
          full_name: email,
        });
        const { logAudit } = await import("./reservation-engine.server");
        await logAudit({
          actorId: context.userId,
          action: "staff.bootstrap_owner",
          entity: "staff_member",
          entityId: context.userId,
          details: { email },
        });
        role = "owner";
      }
    }

    return { role, email: (context.claims.email as string | undefined) ?? null };
  });

/* -------------------------------------------------------------- dashboard */

export const getOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { date: string }) => input)
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const start = engine.localToUtc(data.date, "00:00");
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const [{ data: todays }, { data: tables }, { count: waiting }] = await Promise.all([
      supabaseAdmin
        .from("reservations")
        .select("id, guest_count, status")
        .eq("restaurant_id", RESTAURANT)
        .gte("reserved_at", start.toISOString())
        .lt("reserved_at", end.toISOString()),
      supabaseAdmin.from("restaurant_tables").select("id, status, is_active").eq("restaurant_id", RESTAURANT),
      supabaseAdmin
        .from("waitlist")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", RESTAURANT)
        .eq("status", "waiting"),
    ]);

    const rows = todays ?? [];
    const active = rows.filter((r) => !["cancelled", "no_show"].includes(r.status));
    const activeTables = (tables ?? []).filter((t) => t.is_active);

    return {
      reservations: active.length,
      guests: active.reduce((s, r) => s + r.guest_count, 0),
      pending: rows.filter((r) => r.status === "pending").length,
      seated: rows.filter((r) => r.status === "seated").length,
      totalTables: activeTables.length,
      occupiedTables: activeTables.filter((t) => t.status === "occupied").length,
      reservedTables: activeTables.filter((t) => t.status === "reserved").length,
      availableTables: activeTables.filter((t) => t.status === "available").length,
      waitlist: waiting ?? 0,
    };
  });

/* ----------------------------------------------------------- reservations */

export const listReservations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { from: string; to: string; status?: string; search?: string }) => input)
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const start = engine.localToUtc(data.from, "00:00");
    const end = new Date(engine.localToUtc(data.to, "00:00").getTime() + 24 * 60 * 60 * 1000);

    let query = supabaseAdmin
      .from("reservations")
      .select(
        "id, booking_code, customer_name, customer_phone, customer_email, guest_count, reserved_at, duration_minutes, status, source, occasion, special_request, preferred_location, internal_notes, table_id, restaurant_tables(table_number, name, location)",
      )
      .eq("restaurant_id", RESTAURANT)
      .gte("reserved_at", start.toISOString())
      .lt("reserved_at", end.toISOString())
      .order("reserved_at");

    if (data.status && data.status !== "all") query = query.eq("status", data.status as never);
    if (data.search?.trim()) {
      const s = data.search.trim();
      query = query.or(
        `customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,booking_code.ilike.%${s}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    return (rows ?? []).map((r) => {
      const parts = engine.utcToLocalParts(r.reserved_at);
      const t = r.restaurant_tables as unknown as { table_number: string; location: string } | null;
      return {
        id: r.id,
        bookingCode: r.booking_code,
        name: r.customer_name,
        phone: r.customer_phone,
        email: r.customer_email,
        guests: r.guest_count,
        date: parts.date,
        time: parts.time,
        status: r.status,
        source: r.source,
        occasion: r.occasion,
        specialRequest: r.special_request,
        preferredLocation: r.preferred_location,
        internalNotes: r.internal_notes,
        tableId: r.table_id,
        tableNumber: t?.table_number ?? null,
      };
    });
  });

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "seated", "completed", "cancelled", "no_show"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "seated") patch.seated_at = now;
    if (data.status === "completed") patch.completed_at = now;
    if (data.status === "cancelled") patch.cancelled_at = now;

    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .update(patch as never)
      .eq("id", data.id)
      .select("id, table_id, customer_id, customer_email, booking_code")
      .single();
    if (error) throw new Error(error.message);

    if (row.table_id) {
      const tableStatus =
        data.status === "seated"
          ? "occupied"
          : ["completed", "cancelled", "no_show"].includes(data.status)
            ? "available"
            : "reserved";
      await supabaseAdmin
        .from("restaurant_tables")
        .update({ status: tableStatus as never })
        .eq("id", row.table_id);
    }

    if (row.customer_id) {
      if (data.status === "completed") {
        const { data: c } = await supabaseAdmin
          .from("customers")
          .select("completed_visits")
          .eq("id", row.customer_id)
          .single();
        await supabaseAdmin
          .from("customers")
          .update({ completed_visits: (c?.completed_visits ?? 0) + 1, last_visit_at: now })
          .eq("id", row.customer_id);
      }
      if (data.status === "no_show") {
        const { data: c } = await supabaseAdmin
          .from("customers")
          .select("no_show_count")
          .eq("id", row.customer_id)
          .single();
        await supabaseAdmin
          .from("customers")
          .update({ no_show_count: (c?.no_show_count ?? 0) + 1 })
          .eq("id", row.customer_id);
      }
    }

    if (data.status === "cancelled" && row.customer_email) {
      await engine.queueNotification({
        reservationId: row.id,
        channel: "email",
        type: "cancellation",
        recipient: row.customer_email,
        subject: `Reservation ${row.booking_code} cancelled`,
        body: `Your reservation ${row.booking_code} has been cancelled by the restaurant.`,
      });
    }

    await engine.logAudit({
      actorId: context.userId,
      action: `reservation.${data.status}`,
      entity: "reservation",
      entityId: data.id,
    });
    return { ok: true };
  });

export const assignTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reservationId: string; tableId: string | null }) => input)
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const { data: res, error: resErr } = await supabaseAdmin
      .from("reservations")
      .select("id, reserved_at, duration_minutes, buffer_minutes")
      .eq("id", data.reservationId)
      .single();
    if (resErr) throw new Error(resErr.message);

    if (data.tableId) {
      const parts = engine.utcToLocalParts(res.reserved_at);
      const dayReservations = await engine.loadDayReservations(parts.date);
      const links = await engine.loadReservationTableLinks(dayReservations.map((r) => r.id));
      const busy = engine.busyTableIds(
        dayReservations,
        new Date(res.reserved_at),
        res.duration_minutes,
        res.buffer_minutes,
        links,
        res.id,
      );
      if (busy.has(data.tableId)) throw new Error("That table is already booked for this time.");
    }

    const { error } = await supabaseAdmin
      .from("reservations")
      .update({ table_id: data.tableId })
      .eq("id", data.reservationId);
    if (error) throw new Error(error.message);

    await engine.logAudit({
      actorId: context.userId,
      action: "reservation.table_assigned",
      entity: "reservation",
      entityId: data.reservationId,
      details: { tableId: data.tableId },
    });
    return { ok: true };
  });

export const createStaffReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(7).max(25),
        email: z.string().trim().email().max(255).optional().or(z.literal("")),
        guestCount: z.number().int().min(1).max(30),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        time: z.string().regex(/^\d{2}:\d{2}$/),
        source: z.enum(["walk_in", "phone", "admin"]),
        tableId: z.string().uuid().nullable().optional(),
        specialRequest: z.string().trim().max(500).optional().or(z.literal("")),
        seatNow: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const settings = await engine.loadSettings();
    const start = engine.localToUtc(data.date, data.time);
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

    let tableId = data.tableId ?? null;
    let label = tables.find((t) => t.id === tableId)?.table_number ?? "Unassigned";
    if (tableId && busy.has(tableId)) throw new Error("That table is already booked for this time.");
    if (!tableId) {
      const pick = engine.pickBestTable(tables, busy, data.guestCount, null);
      if (!pick) throw new Error("No table free for that party size and time.");
      tableId = pick.tableIds[0];
      label = pick.label;
    }

    const customerId = await engine.upsertCustomer({
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
    });

    const bookingCode = engine.generateBookingCode();
    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        booking_code: bookingCode,
        restaurant_id: RESTAURANT,
        customer_id: customerId,
        table_id: tableId,
        guest_count: data.guestCount,
        reserved_at: start.toISOString(),
        duration_minutes: settings.default_duration_minutes,
        buffer_minutes: settings.buffer_minutes,
        status: data.seatNow ? "seated" : "confirmed",
        source: data.source,
        special_request: data.specialRequest || null,
        customer_name: data.fullName,
        customer_phone: data.phone,
        customer_email: data.email || null,
        created_by: context.userId,
        seated_at: data.seatNow ? new Date().toISOString() : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("restaurant_tables")
      .update({ status: data.seatNow ? "occupied" : "reserved" })
      .eq("id", tableId);

    await engine.logAudit({
      actorId: context.userId,
      action: "reservation.created",
      entity: "reservation",
      entityId: row.id,
      details: { source: data.source, bookingCode },
    });

    return { bookingCode, tableLabel: label };
  });

/* ----------------------------------------------------------------- tables */

export const listFloorPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: sections }, { data: tables }] = await Promise.all([
      supabaseAdmin
        .from("table_sections")
        .select("id, name, location, sort_order")
        .eq("restaurant_id", RESTAURANT)
        .order("sort_order"),
      supabaseAdmin
        .from("restaurant_tables")
        .select(
          "id, section_id, table_number, name, capacity, minimum_guests, maximum_guests, location, status, description, is_active",
        )
        .eq("restaurant_id", RESTAURANT)
        .order("table_number"),
    ]);
    return { sections: sections ?? [], tables: tables ?? [] };
  });

export const saveTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional().nullable(),
        sectionId: z.string().uuid().nullable(),
        tableNumber: z.string().trim().min(1).max(20),
        name: z.string().trim().max(60).optional().or(z.literal("")),
        capacity: z.number().int().min(1).max(30),
        minimumGuests: z.number().int().min(1).max(30),
        maximumGuests: z.number().int().min(1).max(40),
        location: z.enum(["indoor", "outdoor", "bar", "private", "window"]),
        description: z.string().trim().max(200).optional().or(z.literal("")),
        isActive: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireManager } = await import("./admin.server");
    await requireManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("./reservation-engine.server");

    const payload = {
      restaurant_id: RESTAURANT,
      section_id: data.sectionId,
      table_number: data.tableNumber,
      name: data.name || null,
      capacity: data.capacity,
      minimum_guests: data.minimumGuests,
      maximum_guests: data.maximumGuests,
      location: data.location,
      description: data.description || null,
      is_active: data.isActive,
    };

    if (data.id) {
      const { error } = await supabaseAdmin.from("restaurant_tables").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("restaurant_tables").insert(payload);
      if (error) throw new Error(error.message);
    }
    await logAudit({
      actorId: context.userId,
      action: data.id ? "table.updated" : "table.created",
      entity: "table",
      entityId: data.id ?? null,
      details: { tableNumber: data.tableNumber },
    });
    return { ok: true };
  });

export const deleteTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const { requireManager } = await import("./admin.server");
    await requireManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("./reservation-engine.server");
    const { error } = await supabaseAdmin.from("restaurant_tables").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit({ actorId: context.userId, action: "table.deleted", entity: "table", entityId: data.id });
    return { ok: true };
  });

export const setTableStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["available", "occupied", "reserved", "unavailable"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("restaurant_tables")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------------------------------------------- waitlist */

export const listWaitlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");
    const { data } = await supabaseAdmin
      .from("waitlist")
      .select("*")
      .eq("restaurant_id", RESTAURANT)
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((w) => ({
      id: w.id,
      name: w.full_name,
      phone: w.phone,
      email: w.email,
      guests: w.guest_count,
      status: w.status,
      notes: w.notes,
      ...engine.utcToLocalParts(w.preferred_time),
    }));
  });

export const updateWaitlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["waiting", "notified", "seated", "cancelled", "expired"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const { data: row, error } = await supabaseAdmin
      .from("waitlist")
      .update({
        status: data.status,
        notified_at: data.status === "notified" ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .select("id, full_name, phone, email")
      .single();
    if (error) throw new Error(error.message);

    if (data.status === "notified") {
      await engine.queueNotification({
        waitlistId: row.id,
        channel: "sms",
        type: "waitlist_table_ready",
        recipient: row.phone,
        body: `Hi ${row.full_name}, a table is now available at Himalchuli Bar & Grill. Please reply or call us to confirm.`,
      });
    }
    return { ok: true };
  });

/* -------------------------------------------------------------- customers */

export const listCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { search?: string }) => input)
  .handler(async ({ data, context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("customers")
      .select("*")
      .eq("restaurant_id", RESTAURANT)
      .order("total_reservations", { ascending: false })
      .limit(200);
    if (data.search?.trim()) {
      const s = data.search.trim();
      q = q.or(`full_name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((c) => ({
      id: c.id,
      name: c.full_name,
      phone: c.phone,
      email: c.email,
      totalReservations: c.total_reservations,
      completedVisits: c.completed_visits,
      noShows: c.no_show_count,
      lastVisit: c.last_visit_at,
      preferences: c.preferences as Record<string, string> | null,
      notes: c.notes,
    }));
  });

/* --------------------------------------------------------------- settings */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { loadSettings } = await import("./reservation-engine.server");
    const s = await loadSettings();
    return {
      openingHours: s.opening_hours,
      defaultDurationMinutes: s.default_duration_minutes,
      bufferMinutes: s.buffer_minutes,
      slotIntervalMinutes: s.slot_interval_minutes,
      maxCoversPerSlot: s.max_covers_per_slot,
      maxPartySize: s.max_party_size,
      advanceBookingDays: s.advance_booking_days,
      autoConfirm: s.auto_confirm,
      cancellationPolicy: s.cancellation_policy,
    };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        openingHours: z.record(
          z.string(),
          z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
        ),
        defaultDurationMinutes: z.number().int().min(30).max(360),
        bufferMinutes: z.number().int().min(0).max(120),
        slotIntervalMinutes: z.number().int().min(15).max(60),
        maxCoversPerSlot: z.number().int().min(1).max(500),
        maxPartySize: z.number().int().min(1).max(50),
        advanceBookingDays: z.number().int().min(1).max(365),
        autoConfirm: z.boolean(),
        cancellationPolicy: z.string().trim().max(600),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireManager } = await import("./admin.server");
    await requireManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("restaurant_settings")
      .update({
        opening_hours: data.openingHours as never,
        default_duration_minutes: data.defaultDurationMinutes,
        buffer_minutes: data.bufferMinutes,
        slot_interval_minutes: data.slotIntervalMinutes,
        max_covers_per_slot: data.maxCoversPerSlot,
        max_party_size: data.maxPartySize,
        advance_booking_days: data.advanceBookingDays,
        auto_confirm: data.autoConfirm,
        cancellation_policy: data.cancellationPolicy,
      })
      .eq("restaurant_id", RESTAURANT);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------------------------------------------------- analytics */

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const engine = await import("./reservation-engine.server");

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows } = await supabaseAdmin
      .from("reservations")
      .select("id, guest_count, reserved_at, status, customer_id")
      .eq("restaurant_id", RESTAURANT)
      .gte("reserved_at", since);

    const list = rows ?? [];
    const byDay = new Map<string, number>();
    const byHour = new Map<string, number>();
    for (const r of list) {
      const p = engine.utcToLocalParts(r.reserved_at);
      byDay.set(p.date, (byDay.get(p.date) ?? 0) + 1);
      const hour = `${p.time.slice(0, 2)}:00`;
      byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
    }
    const noShows = list.filter((r) => r.status === "no_show").length;
    const guests = list.reduce((s, r) => s + r.guest_count, 0);
    const customerCounts = new Map<string, number>();
    for (const r of list) if (r.customer_id) customerCounts.set(r.customer_id, (customerCounts.get(r.customer_id) ?? 0) + 1);
    const returning = [...customerCounts.values()].filter((n) => n > 1).length;

    return {
      total: list.length,
      last7: list.filter((r) => new Date(r.reserved_at).getTime() > Date.now() - 7 * 864e5).length,
      guests,
      averageParty: list.length ? Math.round((guests / list.length) * 10) / 10 : 0,
      noShowRate: list.length ? Math.round((noShows / list.length) * 1000) / 10 : 0,
      returningCustomers: returning,
      revenueOpportunity: guests * 38, // average spend per cover estimate
      daily: [...byDay.entries()].sort().map(([date, count]) => ({ date: date.slice(5), count })),
      popularTimes: [...byHour.entries()].sort().map(([hour, count]) => ({ hour, count })),
    };
  });

/* ------------------------------------------------------------------ staff */

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireManager } = await import("./admin.server");
    await requireManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: staff }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("staff_members").select("user_id, full_name, email, is_active"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    return (staff ?? []).map((s) => ({
      userId: s.user_id,
      name: s.full_name,
      email: s.email,
      active: s.is_active,
      role: (roles ?? []).find((r) => r.user_id === s.user_id)?.role ?? "staff",
    }));
  });

// Owner creates a brand-new staff account and sends them a Supabase invite email.
// There is no public sign-up route — this is the only way a new login gets created.
export const inviteStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        fullName: z.string().trim().min(2).max(100),
        role: z.enum(["owner", "manager", "staff"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireOwner } = await import("./admin.server");
    await requireOwner(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("./reservation-engine.server");

    const origin = siteOrigin();
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
      redirectTo: origin ? `${origin}/reset-password` : undefined,
    });
    if (error) throw new Error(error.message);

    const userId = invited.user.id;

    const { error: staffErr } = await supabaseAdmin.from("staff_members").insert({
      user_id: userId,
      restaurant_id: RESTAURANT,
      email: data.email,
      full_name: data.fullName,
      is_active: true,
    });
    if (staffErr) throw new Error(staffErr.message);

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role });
    if (roleErr) throw new Error(roleErr.message);

    await logAudit({
      actorId: context.userId,
      action: "staff.invited",
      entity: "staff_member",
      entityId: userId,
      details: { email: data.email, fullName: data.fullName, role: data.role },
    });

    return { ok: true };
  });

// Owner changes the role of an existing staff account.
export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email(),
        role: z.enum(["owner", "manager", "staff"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireOwner } = await import("./admin.server");
    await requireOwner(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("./reservation-engine.server");

    const callerEmail = (context.claims.email as string | undefined)?.toLowerCase();
    if (callerEmail && callerEmail === data.email) {
      throw new Error("You can't change your own role — ask another owner to do it.");
    }

    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw new Error(listErr.message);
    const user = users.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("No account with that email — invite them first.");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: user.id, role: data.role });
    if (error) throw new Error(error.message);

    const { data: existing } = await supabaseAdmin
      .from("staff_members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("staff_members").insert({
        user_id: user.id,
        restaurant_id: RESTAURANT,
        email: user.email,
        full_name: user.email,
      });
    }

    await logAudit({
      actorId: context.userId,
      action: "staff.role_changed",
      entity: "staff_member",
      entityId: user.id,
      details: { email: data.email, role: data.role },
    });

    return { ok: true };
  });

// Owner disables or re-enables a staff account. Disabling blocks the account both
// at the RBAC layer (getRole returns null) and at the Supabase Auth layer (banned,
// so even an unexpired session can't refresh and password sign-in is rejected).
export const setStaffActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireOwner } = await import("./admin.server");
    await requireOwner(context.userId);
    if (data.userId === context.userId && !data.active) {
      throw new Error("You can't disable your own account.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { logAudit } = await import("./reservation-engine.server");

    const { error } = await supabaseAdmin
      .from("staff_members")
      .update({ is_active: data.active })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "876000h", // effectively indefinite
    });
    if (authErr) throw new Error(authErr.message);

    await logAudit({
      actorId: context.userId,
      action: data.active ? "staff.enabled" : "staff.disabled",
      entity: "staff_member",
      entityId: data.userId,
    });

    return { ok: true };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireManager } = await import("./admin.server");
    await requireManager(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("audit_logs")
      .select("id, actor_id, actor_label, action, entity, entity_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    return data ?? [];
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStaff } = await import("./admin.server");
    await requireStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("notifications")
      .select("id, channel, type, recipient, subject, body, status, scheduled_for, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });