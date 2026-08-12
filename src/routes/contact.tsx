import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import heroInterior from "@/assets/hero-interior.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Himalchuli Bar & Grill" },
      { name: "description", content: "Get in touch with Himalchuli Bar & Grill in Haverhill MA. Address, phone, hours and message form." },
      { property: "og:title", content: "Contact Himalchuli Bar & Grill" },
      { property: "og:description", content: "Visit or reach out — we'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  //   const schedule = [
  //   { day: "Sunday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:30 PM"] },
  //   { day: "Monday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
  //   { day: "Tuesday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
  //   { day: "Wednesday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
  //   { day: "Thursday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
  //   { day: "Friday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
  //   { day: "Saturday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:30 PM"] },
  // ];

  const schedule = [
    { day: "Sunday", hours: ["11:00 AM – 10:30 PM"] },
    { day: "Monday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Tuesday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Wednesday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Thursday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Friday", hours: ["11:00 AM – 10:00 PM"] },
    { day: "Saturday", hours: ["11:00 AM – 10:30 PM"] },
  ];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
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
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-surface/20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-8"> <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Contact</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Get in Touch</h1></div>

      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-3 md:px-8">
        {[
          { icon: MapPin, title: "Address", body: "36 Plaistow Rd, Haverhill, 01830" },
          { icon: Phone, title: "Call Us", body: "9782414259" },
          { icon: Mail, title: "Email", body: "himalchuli2026@gmail.com" },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <c.icon className="mx-auto h-10 w-10 text-primary" />
            <h3 className="mt-4 font-display text-xl font-semibold uppercase tracking-wide">{c.title}</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Opening Hours</h2>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              { day: "Sunday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:30 PM"] },
              { day: "Monday", hours: ["Closed"] },
              { day: "Tuesday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
              { day: "Wednesday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
              { day: "Thursday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
              { day: "Friday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:00 PM"] },
              { day: "Saturday", hours: ["11:00 AM – 2:30 PM", "4:30 PM – 10:30 PM"] },
            ].map((item) => (
              <li key={item.day} className="flex items-start justify-between border-b border-border pb-3">
                <span className="flex items-center gap-2 font-semibold">
                  <Clock className="h-4 w-4 text-primary" />
                  {item.day}
                </span>
                <div className="text-right text-muted-foreground">
                  {item.hours.map((time, idx) => (
                    <div key={idx}>{time}</div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent — we'll reply within a day.");
            setForm({ name: "", email: "", subject: "", message: "" });
          }}
          className="rounded-2xl border border-border bg-card p-8 shadow-lg"
        >
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Send a Message</h2>
          <div className="mt-6 grid gap-4">
            <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <textarea required rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <button type="submit" className="mt-2 rounded-md bg-primary py-3.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90">
              Send Message
            </button>
          </div>
        </form>
      </section>
    </>
  );
}