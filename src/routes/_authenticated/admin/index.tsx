import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { STATUS_LABELS, formatTimeLabel, type ReservationStatus } from "@/lib/reservations.shared";
import { getOverview, listReservations, updateReservationStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Today's Overview — Himalchuli Reservations" },
      { name: "description", content: "Live covers, table status and arrivals for today's service." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Today's Overview — Himalchuli Reservations" },
      { property: "og:description", content: "Live covers, table status and arrivals for today's service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Today,
});

const today = () => new Date().toISOString().slice(0, 10);

function Today() {
  const [date, setDate] = useState(today());
  const qc = useQueryClient();
  const overviewFn = useServerFn(getOverview);
  const listFn = useServerFn(listReservations);
  const statusFn = useServerFn(updateReservationStatus);

  const overview = useQuery({
    queryKey: ["overview", date],
    queryFn: () => overviewFn({ data: { date } }),
    refetchInterval: 30000,
  });
  const list = useQuery({
    queryKey: ["reservations", date, date, "all", ""],
    queryFn: () => listFn({ data: { from: date, to: date } }),
    refetchInterval: 30000,
  });

  async function setStatus(id: string, status: ReservationStatus) {
    try {
      await statusFn({ data: { id, status } });
      toast.success(`Marked ${STATUS_LABELS[status]}`);
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const o = overview.data;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Today's overview</h1>
          <p className="text-sm text-muted-foreground">Live service board — refreshes every 30 seconds.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Reservations" value={o?.reservations ?? 0} />
        <Stat label="Expected guests" value={o?.guests ?? 0} />
        <Stat label="Pending confirmation" value={o?.pending ?? 0} />
        <Stat label="Currently seated" value={o?.seated ?? 0} />
        <Stat label="Tables available" value={`${o?.availableTables ?? 0}/${o?.totalTables ?? 0}`} />
        <Stat label="Tables occupied" value={o?.occupiedTables ?? 0} />
        <Stat label="Tables reserved" value={o?.reservedTables ?? 0} />
        <Stat label="On waitlist" value={o?.waitlist ?? 0} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-wide">Arrivals</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Party</th>
                <th className="p-3">Table</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 font-semibold">{formatTimeLabel(r.time)}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.phone}</div>
                  </td>
                  <td className="p-3">{r.guests}</td>
                  <td className="p-3">{r.tableNumber ?? "—"}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status as ReservationStatus} />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {r.status === "pending" && (
                        <Action onClick={() => setStatus(r.id, "confirmed")}>Confirm</Action>
                      )}
                      {["pending", "confirmed"].includes(r.status) && (
                        <Action onClick={() => setStatus(r.id, "seated")}>Seat</Action>
                      )}
                      {r.status === "seated" && (
                        <Action onClick={() => setStatus(r.id, "completed")}>Complete</Action>
                      )}
                      {["pending", "confirmed"].includes(r.status) && (
                        <Action onClick={() => setStatus(r.id, "no_show")}>No-show</Action>
                      )}
                      {!["cancelled", "completed"].includes(r.status) && (
                        <Action onClick={() => setStatus(r.id, "cancelled")}>Cancel</Action>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.data?.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No reservations for this date yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const tone: Record<string, string> = {
    pending: "bg-chart-4/20 text-chart-4",
    confirmed: "bg-chart-2/20 text-chart-2",
    seated: "bg-primary/20 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    no_show: "bg-destructive/25 text-destructive",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status] ?? "bg-muted"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Action({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold hover:border-primary hover:text-primary"
    >
      {children}
    </button>
  );
}
