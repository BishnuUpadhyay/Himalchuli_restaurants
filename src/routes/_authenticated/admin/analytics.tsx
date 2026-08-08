import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Himalchuli Dashboard" },
      { name: "description", content: "Covers, peak hours, no-show rate and returning guest insights." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Analytics — Himalchuli Dashboard" },
      { property: "og:description", content: "Covers, peak hours, no-show rate and returning guest insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  const fn = useServerFn(getAnalytics);
  const q = useQuery({ queryKey: ["analytics"], queryFn: () => fn() });
  const a = q.data;
  const peak = Math.max(1, ...(a?.popularTimes ?? []).map((p) => p.count));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 30 days of reservation performance.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reservations" value={a?.total ?? 0} />
        <Stat label="Last 7 days" value={a?.last7 ?? 0} />
        <Stat label="Total covers" value={a?.guests ?? 0} />
        <Stat label="Avg party size" value={a?.averageParty ?? 0} />
        <Stat label="No-show rate" value={`${a?.noShowRate ?? 0}%`} />
        <Stat label="Returning guests" value={a?.returningCustomers ?? 0} />
        <Stat label="Est. covers value" value={`$${(a?.revenueOpportunity ?? 0).toLocaleString()}`} />
      </div>
      <section>
        <h2 className="mb-3 font-display text-lg font-bold uppercase">Popular times</h2>
        <div className="space-y-2 rounded-xl border border-border bg-card p-5">
          {(a?.popularTimes ?? []).map((p) => (
            <div key={p.hour} className="flex items-center gap-3 text-sm">
              <span className="w-14 text-muted-foreground">{p.hour}</span>
              <div className="h-3 flex-1 rounded-full bg-muted">
                <div className="h-3 rounded-full bg-primary" style={{ width: `${(p.count / peak) * 100}%` }} />
              </div>
              <span className="w-8 text-right">{p.count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
