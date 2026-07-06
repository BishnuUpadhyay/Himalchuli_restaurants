import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Himalchuli Bar & Grill" },
      { name: "description", content: "Get in touch with Himalchuli Bar & Grill in Washington DC. Address, phone, hours and message form." },
      { property: "og:title", content: "Contact Himalchuli Bar & Grill" },
      { property: "og:description", content: "Visit or reach out — we'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  return (
    <>
      <section className="bg-surface py-20 text-center">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-primary">Contact</p>
        <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide text-white md:text-6xl">Get in Touch</h1>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-3 md:px-8">
        {[
          { icon: MapPin, title: "Address", body: "123 Mountain View Ave\nWashington, DC 20001" },
          { icon: Phone, title: "Call Us", body: "(202) 555-0142\n(202) 555-0143" },
          { icon: Mail, title: "Email", body: "hello@himalchuli-dc.com\nbookings@himalchuli-dc.com" },
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
              ["Monday – Thursday", "11:30 – 22:00"],
              ["Friday – Saturday", "11:30 – 23:30"],
              ["Sunday", "12:00 – 21:30"],
            ].map(([d, h]) => (
              <li key={d} className="flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4 text-primary" />{d}</span>
                <span className="text-muted-foreground">{h}</span>
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