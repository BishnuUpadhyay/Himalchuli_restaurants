import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import heroInterior from "@/assets/hero-interior.jpg";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book a Table — Himalchuli Bar & Grill" },
      { name: "description", content: "Reserve your table at Himalchuli Bar & Grill. Fast, easy online booking for dine-in and private events." },
      { property: "og:title", content: "Book a Table — Himalchuli Bar & Grill" },
      { property: "og:description", content: "Reserve online in seconds." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", datetime: "", people: "2", request: "" });

  return (
    <>
      <section className="relative isolate overflow-hidden bg-surface py-20 text-center">
        <img src={heroInterior} alt="" aria-hidden width={1600} height={900} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Reservation</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Book a Table</h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Reserve your seat</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Tell us when and how many — we'll confirm within an hour during opening times. For parties of 8 or more, please call us directly at (202) 555-0142.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div><span className="font-semibold uppercase tracking-wider text-primary">Address · </span>123 Mountain View Ave, Washington DC</div>
            <div><span className="font-semibold uppercase tracking-wider text-primary">Hours · </span>Daily 11:30 – 22:00 (later on Fri–Sat)</div>
            <div><span className="font-semibold uppercase tracking-wider text-primary">Phone · </span>(202) 555-0142</div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Reservation received! We'll confirm shortly.");
            setForm({ name: "", email: "", phone: "", datetime: "", people: "2", request: "" });
          }}
          className="rounded-2xl border border-border bg-card p-8 shadow-lg"
        >
          <div className="grid gap-4">
            <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input required placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <div className="grid grid-cols-2 gap-4">
              <input required type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
              <select value={form.people} onChange={(e) => setForm({ ...form, people: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>)}
              </select>
            </div>
            <textarea rows={4} placeholder="Special Request" value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <button type="submit" className="mt-2 rounded-md bg-primary py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
              Book Now
            </button>
          </div>
        </form>
      </section>
    </>
  );
}