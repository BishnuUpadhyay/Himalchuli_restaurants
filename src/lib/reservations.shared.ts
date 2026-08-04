// Client-safe types, constants and validation schemas for the reservation platform.
import { z } from "zod";

export const RESTAURANT_TIMEZONE = "America/New_York";

export const TABLE_LOCATIONS = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "bar", label: "Bar Seating" },
  { value: "private", label: "Private Area" },
  { value: "window", label: "Window Seat" },
] as const;

export type TableLocation = (typeof TABLE_LOCATIONS)[number]["value"];

export const OCCASIONS = [
  { value: "none", label: "No special occasion" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "business", label: "Business Meeting" },
  { value: "other", label: "Other" },
] as const;

export type Occasion = (typeof OCCASIONS)[number]["value"];

export const RESERVATION_STATUSES = [
  "pending",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const TABLE_STATUSES = ["available", "occupied", "reserved", "unavailable"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  seated: "Seated",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid mobile number")
  .max(25, "Mobile number is too long")
  .regex(/^[+()\-\s\d]+$/, "Enter a valid mobile number");

export const bookingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a time"),
  guestCount: z.number().int().min(1).max(30),
  preferredLocation: z
    .enum(["indoor", "outdoor", "bar", "private", "window"])
    .nullable()
    .optional(),
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email").max(255),
  occasion: z.enum(["none", "birthday", "anniversary", "business", "other"]).default("none"),
  specialRequest: z.string().trim().max(500).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const waitlistSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  guestCount: z.number().int().min(1).max(30),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export type TimeSlot = {
  time: string; // HH:mm local restaurant time
  label: string; // 7:00 PM
  available: boolean;
  tablesLeft: number;
};

export type BookingConfirmation = {
  bookingCode: string;
  date: string;
  time: string;
  timeLabel: string;
  guestCount: number;
  tableLabel: string;
  status: ReservationStatus;
  durationMinutes: number;
};

export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function locationLabel(value?: string | null) {
  if (!value) return "Any";
  return TABLE_LOCATIONS.find((l) => l.value === value)?.label ?? value;
}
