import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";
import heroInterior from "@/assets/hero-interior.jpg";
import {
  OCCASIONS,
  TABLE_LOCATIONS,
  bookingSchema,
  formatTimeLabel,
  type BookingConfirmation,
} from "@/lib/reservations.shared";
import { createReservation, getAvailability, getBookingConfig, joinWaitlist } from "@/lib/booking.functions";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a Table — Himalchuli Bar & Grill" },
      {
        name: "description",
        content:
          "Reserve a table at Himalchuli Bar & Grill in Haverhill, MA. Pick your date, party size, time and seating preference — confirmed instantly.",
      },
      { property: "og:title", content: "Book a Table — Himalchuli Bar & Grill" },
      {
        property: "og:description",
        content: "Live table availability and instant confirmation for dine-in and private events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingPage,
});

const todayISO = () => new Date().toISOString().slice(0, 10);

const stepTitles = ["Date & guests", "Time", "Seating", "Your details"];

function BookingPage() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(todayISO());
  const [guestCount, setGuestCount] = useState(2);
  const [time, setTime] = useState<string | null>(null);
  const [preferredLocation, setPreferredLocation] = useState<string | null>(null);
  const [details, setDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
    occasion: "none",
    specialRequest: "",
  });
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);

  const configFn = useServerFn(getBookingConfig);
  const availabilityFn = useServerFn(getAvailability);
  const createFn = useServerFn(createReservation);
  const waitlistFn = useServerFn(joinWaitlist);

  const config = useQuery({ queryKey: ["booking-config"], queryFn: () => configFn() });

  const availability = useQuery({
    queryKey: ["availability", date, guestCount, preferredLocation],
    queryFn: () => availabilityFn({ data: { date, guestCount, location: preferredLocation } }),
    enabled: step >= 1 && !confirmation,
  });

  const maxDate = useMemo(() => {
    const days = config.data?.advanceBookingDays ?? 90;
    return new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
  }, [config.data]);

  const booking = useMutation({
    mutationFn: async () => {
      const parsed = bookingSchema.parse({
        date,
        time,
        guestCount,
        preferredLocation,
        fullName: details.fullName,
        phone: details.phone,
        email: details.email,
        occasion: details.occasion,
        specialRequest: details.specialRequest,
      });
      return createFn({ data: parsed });
    },
    onSuccess: (result) => setConfirmation(result),
    onError: (error: Error) => toast.error(error.message || "We couldn't complete that booking."),
  });

  const waitlist = useMutation({
    mutationFn: async () =>
      waitlistFn({
        data: {
          fullName: details.fullName,
          phone: details.phone,
          email: details.email,
          guestCount,
          date,
          time: time ?? "19:00",
          notes: details.specialRequest,
        },
      }),
    onSuccess: () => {
      toast.success("You're on the waitlist — we'll call you as soon as a table opens.");
      setShowWaitlist(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (confirmation) {
    return <Confirmed confirmation={confirmation} policy={config.data?.cancellationPolicy} />;
  }

  const slots = availability.data?.slots ?? [];
  const openSlots = slots.filter((s) => s.available);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface py-20 text-center">
        <img
          src={heroInterior}
          alt=""
          aria-hidden
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            Reservation
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-foreground md:text-6xl">
            Book a Table
          </h1>
          <p className="mx-auto mt-4 max-w-xl px-4 text-sm text-muted-foreground">
            Live table availability. Choose a time, tell us how to seat you, and get an instant confirmation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 md:px-8">
        <ol className="mb-10 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wider">
          {stepTitles.map((title, i) => (
            <li
              key={title}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-semibold ${
                i === step
                  ? "border-primary bg-primary/10 text-primary"
                  : i < step
                    ? "border-border text-muted-foreground"
                    : "border-border/50 text-muted-foreground/60"
              }`}
            >
              <span>{i + 1}</span>
              {title}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          {step === 0 && (
            <div className="space-y-8">
              <Field icon={<CalendarDays className="h-4 w-4" />} label="Select date">
                <input
                  type="date"
                  value={date}
                  min={todayISO()}
                  max={maxDate}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime(null);
                  }}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
                />
              </Field>

              <Field icon={<Users className="h-4 w-4" />} label="Number of guests">
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: config.data?.maxPartySize ?? 12 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setGuestCount(n);
                        setTime(null);
                      }}
                      className={`h-11 w-11 rounded-md border text-sm font-semibold transition-colors ${
                        guestCount === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Parties larger than {config.data?.maxPartySize ?? 12}? Please call (224) 900-0144.
                </p>
              </Field>

              <NextButton onClick={() => setStep(1)}>Find available times</NextButton>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Field icon={<Clock className="h-4 w-4" />} label={`Available times · ${date}`}>
                {availability.isLoading && <p className="text-sm text-muted-foreground">Checking tables…</p>}
                {availability.data?.closed && (
                  <p className="text-sm text-muted-foreground">We're closed on this date. Please pick another day.</p>
                )}
                {!availability.isLoading && !availability.data?.closed && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTime(slot.time)}
                        className={`rounded-md border px-2 py-3 text-sm font-semibold transition-colors ${
                          time === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : slot.available
                              ? "border-border hover:border-primary"
                              : "cursor-not-allowed border-border/40 text-muted-foreground/40 line-through"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
                {!availability.isLoading && openSlots.length === 0 && !availability.data?.closed && (
                  <div className="mt-4 rounded-md border border-border bg-background p-4 text-sm">
                    <p className="text-muted-foreground">
                      Fully booked for {guestCount} guests on this date.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWaitlist(true);
                        setStep(3);
                      }}
                      className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Join the waitlist
                    </button>
                  </div>
                )}
              </Field>
              <div className="flex gap-3">
                <BackButton onClick={() => setStep(0)} />
                <NextButton disabled={!time} onClick={() => setStep(2)}>
                  Continue
                </NextButton>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Field icon={<MapPin className="h-4 w-4" />} label="Table preference (optional)">
                <div className="grid gap-2 sm:grid-cols-2">
                  <PreferenceButton
                    active={preferredLocation === null}
                    onClick={() => setPreferredLocation(null)}
                    label="No preference"
                  />
                  {TABLE_LOCATIONS.map((loc) => (
                    <PreferenceButton
                      key={loc.value}
                      active={preferredLocation === loc.value}
                      onClick={() => setPreferredLocation(loc.value)}
                      label={loc.label}
                    />
                  ))}
                </div>
              </Field>
              <div className="flex gap-3">
                <BackButton onClick={() => setStep(1)} />
                <NextButton onClick={() => setStep(3)}>Continue</NextButton>
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (showWaitlist) waitlist.mutate();
                else booking.mutate();
              }}
            >
              <div className="rounded-md border border-border bg-background p-4 text-sm">
                <p className="font-semibold text-foreground">
                  {guestCount} guest{guestCount > 1 ? "s" : ""} · {date}
                  {time ? ` · ${formatTimeLabel(time)}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {showWaitlist ? "Waitlist request" : "Held for 2 hours from your arrival time"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Full name *"
                  value={details.fullName}
                  onChange={(v) => setDetails({ ...details, fullName: v })}
                  required
                />
                <TextInput
                  label="Mobile number *"
                  value={details.phone}
                  onChange={(v) => setDetails({ ...details, phone: v })}
                  required
                  type="tel"
                />
              </div>
              <TextInput
                label={showWaitlist ? "Email" : "Email *"}
                value={details.email}
                onChange={(v) => setDetails({ ...details, email: v })}
                required={!showWaitlist}
                type="email"
              />

              {!showWaitlist && (
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                    Special occasion
                  </span>
                  <select
                    value={details.occasion}
                    onChange={(e) => setDetails({ ...details, occasion: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block text-sm">
                <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                  Special request
                </span>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Need a baby chair, near window, birthday decoration…"
                  value={details.specialRequest}
                  onChange={(e) => setDetails({ ...details, specialRequest: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
                />
              </label>

              <div className="flex gap-3">
                <BackButton onClick={() => setStep(showWaitlist ? 1 : 2)} />
                <button
                  type="submit"
                  disabled={booking.isPending || waitlist.isPending}
                  className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {booking.isPending || waitlist.isPending
                    ? "Sending…"
                    : showWaitlist
                      ? "Join waitlist"
                      : "Confirm reservation"}
                </button>
              </div>
              {config.data?.cancellationPolicy && (
                <p className="text-xs text-muted-foreground">{config.data.cancellationPolicy}</p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}

function Confirmed({
  confirmation,
  policy,
}: {
  confirmation: BookingConfirmation;
  policy?: string;
}) {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center md:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide">Reservation confirmed</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        A confirmation has been sent to your email and mobile number.
      </p>

      <dl className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-6 text-left text-sm">
        <Row label="Booking ID" value={confirmation.bookingCode} />
        <Row label="Date" value={confirmation.date} />
        <Row label="Time" value={confirmation.timeLabel} />
        <Row label="Table" value={confirmation.tableLabel} />
        <Row label="Guests" value={String(confirmation.guestCount)} />
        <Row label="Table held for" value={`${confirmation.durationMinutes / 60} hours`} />
        <Row label="Status" value={confirmation.status} />
      </dl>
      {policy && <p className="mt-4 text-xs text-muted-foreground">{policy}</p>}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0">
      <dt className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}

function PreferenceButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"
      }`}
    >
      {label}
    </button>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground"
      />
    </label>
  );
}

function NextButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex-1 rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border px-6 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      Back
    </button>
  );
}
