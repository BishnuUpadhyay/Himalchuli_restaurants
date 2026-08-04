// Availability engine + smart table assignment. Server-only.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { RESTAURANT_TIMEZONE } from "./reservations.shared";
import type { TableLocation, TimeSlot } from "./reservations.shared";

export const RESTAURANT_ID = "11111111-1111-4111-8111-111111111111";

const BLOCKING_STATUSES = ["pending", "confirmed", "seated"] as const;

/** Convert a restaurant-local date + time (YYYY-MM-DD, HH:mm) into a UTC Date. */
export function localToUtc(date: string, time: string, timeZone = RESTAURANT_TIMEZONE): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, 0);
  // Offset of that instant in the target timezone.
  const guess = new Date(asUtc);
  const tzDate = new Date(guess.toLocaleString("en-US", { timeZone }));
  const utcDate = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = tzDate.getTime() - utcDate.getTime();
  return new Date(asUtc - offset);
}

/** Format a UTC instant as restaurant-local parts. */
export function utcToLocalParts(iso: string | Date, timeZone = RESTAURANT_TIMEZONE) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  };
}

export type RestaurantTable = {
  id: string;
  table_number: string;
  name: string | null;
  capacity: number;
  minimum_guests: number;
  maximum_guests: number;
  location: TableLocation;
  status: string;
  is_active: boolean;
};

export type Settings = {
  opening_hours: Record<string, { open: string; close: string; closed: boolean }>;
  default_duration_minutes: number;
  buffer_minutes: number;
  slot_interval_minutes: number;
  max_covers_per_slot: number;
  max_party_size: number;
  advance_booking_days: number;
  auto_confirm: boolean;
  cancellation_policy: string;
};

export async function loadSettings(): Promise<Settings> {
  const { data, error } = await supabaseAdmin
    .from("restaurant_settings")
    .select("*")
    .eq("restaurant_id", RESTAURANT_ID)
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Settings;
}

export async function loadTables(): Promise<RestaurantTable[]> {
  const { data, error } = await supabaseAdmin
    .from("restaurant_tables")
    .select("id, table_number, name, capacity, minimum_guests, maximum_guests, location, status, is_active")
    .eq("restaurant_id", RESTAURANT_ID)
    .order("table_number");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RestaurantTable[];
}

type BusyReservation = {
  id: string;
  table_id: string | null;
  reserved_at: string;
  duration_minutes: number;
  buffer_minutes: number;
  guest_count: number;
};

/** Reservations that block tables on a given local date (plus a day either side for tz safety). */
export async function loadDayReservations(date: string): Promise<BusyReservation[]> {
  const from = localToUtc(date, "00:00");
  const to = new Date(from.getTime() + 36 * 60 * 60 * 1000);
  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select("id, table_id, reserved_at, duration_minutes, buffer_minutes, guest_count")
    .eq("restaurant_id", RESTAURANT_ID)
    .in("status", BLOCKING_STATUSES)
    .gte("reserved_at", new Date(from.getTime() - 12 * 60 * 60 * 1000).toISOString())
    .lte("reserved_at", to.toISOString());
  if (error) throw new Error(error.message);
  return (data ?? []) as BusyReservation[];
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** Table ids that are busy for the requested window. */
export function busyTableIds(
  reservations: BusyReservation[],
  start: Date,
  durationMinutes: number,
  bufferMinutes: number,
  extraTableLinks: { reservation_id: string; table_id: string }[] = [],
  ignoreReservationId?: string,
) {
  const s = start.getTime();
  const e = s + (durationMinutes + bufferMinutes) * 60000;
  const busy = new Set<string>();
  for (const r of reservations) {
    if (ignoreReservationId && r.id === ignoreReservationId) continue;
    const rs = new Date(r.reserved_at).getTime();
    const re = rs + (r.duration_minutes + r.buffer_minutes) * 60000;
    if (!overlaps(s, e, rs, re)) continue;
    if (r.table_id) busy.add(r.table_id);
    for (const link of extraTableLinks) {
      if (link.reservation_id === r.id) busy.add(link.table_id);
    }
  }
  return busy;
}

export type Assignment = { tableIds: string[]; label: string } | null;

/**
 * Smart table assignment.
 * Priority: 1) exact capacity match, 2) preferred location, 3) smallest table that fits.
 * Falls back to combining two tables for larger parties.
 */
export function pickBestTable(
  tables: RestaurantTable[],
  busy: Set<string>,
  guests: number,
  preferredLocation?: TableLocation | null,
): Assignment {
  const candidates = tables.filter(
    (t) => t.is_active && t.status !== "unavailable" && !busy.has(t.id),
  );

  const fits = candidates.filter((t) => t.maximum_guests >= guests && t.minimum_guests <= guests);

  const scored = fits
    .map((t) => ({
      t,
      score:
        (t.capacity === guests ? 0 : 100) +
        (preferredLocation && t.location === preferredLocation ? 0 : 10) +
        (t.capacity - guests) * 2,
    }))
    .sort((a, b) => a.score - b.score);

  if (scored.length > 0) {
    const t = scored[0].t;
    return { tableIds: [t.id], label: t.table_number };
  }

  // Combine two tables for larger parties.
  const combinable = candidates
    .filter((t) => t.location !== "bar")
    .sort((a, b) => b.capacity - a.capacity);
  for (let i = 0; i < combinable.length; i++) {
    for (let j = i + 1; j < combinable.length; j++) {
      const a = combinable[i];
      const b = combinable[j];
      if (a.capacity + b.capacity >= guests) {
        const sameArea = a.location === b.location;
        if (!sameArea) continue;
        return { tableIds: [a.id, b.id], label: `${a.table_number} + ${b.table_number}` };
      }
    }
  }
  return null;
}

export async function loadReservationTableLinks(reservationIds: string[]) {
  if (reservationIds.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("reservation_tables")
    .select("reservation_id, table_id")
    .in("reservation_id", reservationIds);
  if (error) throw new Error(error.message);
  return (data ?? []) as { reservation_id: string; table_id: string }[];
}

/** Build the slot list for a date. */
export async function buildAvailability(
  date: string,
  guests: number,
  preferredLocation?: TableLocation | null,
): Promise<{ slots: TimeSlot[]; closed: boolean; note?: string }> {
  const settings = await loadSettings();
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const hours = settings.opening_hours[String(weekday)];
  if (!hours || hours.closed) return { slots: [], closed: true, note: "Closed on this day" };

  const [tables, reservations] = await Promise.all([loadTables(), loadDayReservations(date)]);
  const links = await loadReservationTableLinks(reservations.map((r) => r.id));

  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const lastSeating = closeMin - 60; // last booking one hour before close
  const step = settings.slot_interval_minutes;
  const now = Date.now();

  const slots: TimeSlot[] = [];
  for (let m = openMin; m <= lastSeating; m += step) {
    const time = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    const start = localToUtc(date, time);
    if (start.getTime() < now + 30 * 60000) continue; // no same-minute bookings

    const busy = busyTableIds(
      reservations,
      start,
      settings.default_duration_minutes,
      settings.buffer_minutes,
      links,
    );

    // covers control
    const windowEnd = start.getTime() + settings.default_duration_minutes * 60000;
    const covers = reservations
      .filter((r) => {
        const rs = new Date(r.reserved_at).getTime();
        return rs >= start.getTime() && rs < windowEnd;
      })
      .reduce((sum, r) => sum + r.guest_count, 0);

    const free = tables.filter(
      (t) =>
        t.is_active &&
        t.status !== "unavailable" &&
        !busy.has(t.id) &&
        t.maximum_guests >= guests &&
        t.minimum_guests <= guests,
    );
    const combo = free.length === 0 ? pickBestTable(tables, busy, guests, preferredLocation) : null;
    const capacityOk = free.length > 0 || !!combo;

    slots.push({
      time,
      label: formatLabel(time),
      available: capacityOk && covers + guests <= settings.max_covers_per_slot,
      tablesLeft: free.length,
    });
  }

  return { slots, closed: false };
}

function formatLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function generateBookingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `HB-${out}`;
}

export async function queueNotification(input: {
  reservationId?: string;
  waitlistId?: string;
  channel: "email" | "sms" | "whatsapp";
  type: string;
  recipient: string;
  subject?: string;
  body: string;
  scheduledFor?: Date;
}) {
  await supabaseAdmin.from("notifications").insert({
    reservation_id: input.reservationId ?? null,
    waitlist_id: input.waitlistId ?? null,
    channel: input.channel,
    type: input.type,
    recipient: input.recipient,
    subject: input.subject ?? null,
    body: input.body,
    scheduled_for: (input.scheduledFor ?? new Date()).toISOString(),
    status: "queued",
  });
}

export async function logAudit(input: {
  actorId?: string | null;
  actorLabel?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: input.actorId ?? null,
    actor_label: input.actorLabel ?? null,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId ?? null,
    details: (input.details ?? {}) as never,
  });
}

/** Create or update the customer profile tied to a booking. */
export async function upsertCustomer(input: {
  fullName: string;
  phone: string;
  email?: string | null;
  preferredLocation?: string | null;
}) {
  const { data: existing } = await supabaseAdmin
    .from("customers")
    .select("id, total_reservations, preferences")
    .eq("restaurant_id", RESTAURANT_ID)
    .eq("phone", input.phone)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("customers")
      .update({
        full_name: input.fullName,
        email: input.email ?? null,
        total_reservations: (existing.total_reservations ?? 0) + 1,
        preferences: {
          ...((existing.preferences as Record<string, unknown>) ?? {}),
          ...(input.preferredLocation ? { preferred_location: input.preferredLocation } : {}),
        } as never,
      })
      .eq("id", existing.id);
    return existing.id as string;
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .insert({
      restaurant_id: RESTAURANT_ID,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      total_reservations: 1,
      preferences: (input.preferredLocation
        ? { preferred_location: input.preferredLocation }
        : {}) as never,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}
