import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatTimeLabel } from "@/lib/reservations.shared";
import { listReservations } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Himalchuli Dashboard" },
      { name: "description", content: "Week-at-a-glance view of every upcoming reservation." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Calendar — Himalchuli Dashboard" },
      { property: "og:description", content: "Week-at-a-glance view of every upcoming reservation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarView,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

function CalendarView() {
  const [start, setStart] = useState(iso(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => iso(new Date(new Date(start).getTime() + i * 864e5)));
  const fn = useServerFn(listReservations);
  const q = useQuery({
    queryKey: ["calendar", start],
    queryFn: () => fn({ data: { from: days[0], to: days[6] } }),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Calendar</h1>
          <p className="text-sm text-muted-foreground">Seven-day reservation outlook.</p>
        </div>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </header>
      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {days.map((d) => {
          const rows = (q.data ?? []).filter((r) => r.date === d);
          return (
            <div key={d} className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                {new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {rows.length} bookings · {rows.reduce((s, r) => s + r.guests, 0)} covers
              </div>
              <ul className="mt-3 space-y-2">
                {rows.map((r) => (
                  <li key={r.id} className="rounded-md border border-border/60 bg-background p-2 text-xs">
                    <div className="font-semibold">{formatTimeLabel(r.time)} · {r.guests}p</div>
                    <div className="text-muted-foreground">{r.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
