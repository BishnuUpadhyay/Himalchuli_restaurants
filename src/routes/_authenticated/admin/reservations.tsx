import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { RESERVATION_STATUSES, STATUS_LABELS, formatTimeLabel, type ReservationStatus } from "@/lib/reservations.shared";
import {
  assignTable,
  createStaffReservation,
  listFloorPlan,
  listReservations,
  updateReservationStatus,
} from "@/lib/admin.functions";
import { Action, StatusBadge } from "./index";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Himalchuli Dashboard" },
      { name: "description", content: "Search, filter, assign tables and manage every reservation." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Reservations — Himalchuli Dashboard" },
      { property: "og:description", content: "Search, filter, assign tables and manage every reservation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reservations,
});

const today = () => new Date().toISOString().slice(0, 10);

function Reservations() {
  const qc = useQueryClient();
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  const listFn = useServerFn(listReservations);
  const statusFn = useServerFn(updateReservationStatus);
  const assignFn = useServerFn(assignTable);
  const floorFn = useServerFn(listFloorPlan);
  const createFn = useServerFn(createStaffReservation);

  const list = useQuery({
    queryKey: ["reservations", from, to, status, search],
    queryFn: () => listFn({ data: { from, to, status, search } }),
  });
  const floor = useQuery({ queryKey: ["floor-plan"], queryFn: () => floorFn() });

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    guestCount: 2,
    date: today(),
    time: "19:00",
    source: "phone" as "phone" | "walk_in" | "admin",
    specialRequest: "",
    seatNow: false,
  });

  async function run(fn: () => Promise<unknown>, message: string) {
    try {
      await fn();
      toast.success(message);
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Reservations</h1>
          <p className="text-sm text-muted-foreground">All bookings across web, phone and walk-ins.</p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
        >
          {showNew ? "Close" : "New booking"}
        </button>
      </header>

      {showNew && (
        <form
          className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => createFn({ data: form }), "Reservation created").then(() => setShowNew(false));
          }}
        >
          <Input label="Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} required />
          <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
          <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Input
            label="Guests"
            type="number"
            value={String(form.guestCount)}
            onChange={(v) => setForm({ ...form, guestCount: Number(v) })}
          />
          <Input label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          <Input label="Time" type="time" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Source
            </span>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value as typeof form.source })}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="phone">Phone</option>
              <option value="walk_in">Walk-in</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={form.seatNow}
              onChange={(e) => setForm({ ...form, seatNow: e.target.checked })}
            />
            Seat immediately
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase text-primary-foreground">
              Create reservation
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="From" type="date" value={from} onChange={setFrom} />
        <Input label="To" type="date" value={to} onChange={setTo} />
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="all">All</option>
            {RESERVATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <Input label="Search name / phone / code" value={search} onChange={setSearch} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Date / time</th>
              <th className="p-3">Guest</th>
              <th className="p-3">Party</th>
              <th className="p-3">Table</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3 font-mono text-xs">{r.bookingCode}</td>
                <td className="p-3">
                  <div>{r.date}</div>
                  <div className="text-xs text-muted-foreground">{formatTimeLabel(r.time)}</div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.phone}</div>
                  {r.specialRequest && (
                    <div className="mt-1 text-xs italic text-muted-foreground">“{r.specialRequest}”</div>
                  )}
                </td>
                <td className="p-3">{r.guests}</td>
                <td className="p-3">
                  <select
                    value={r.tableId ?? ""}
                    onChange={(e) =>
                      run(
                        () => assignFn({ data: { reservationId: r.id, tableId: e.target.value || null } }),
                        "Table updated",
                      )
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="">Unassigned</option>
                    {(floor.data?.tables ?? []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} · {t.capacity}p
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <StatusBadge status={r.status as ReservationStatus} />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {RESERVATION_STATUSES.filter((s) => s !== r.status).map((s) => (
                      <Action
                        key={s}
                        onClick={() => run(() => statusFn({ data: { id: r.id, status: s } }), "Status updated")}
                      >
                        {STATUS_LABELS[s]}
                      </Action>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No reservations match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
