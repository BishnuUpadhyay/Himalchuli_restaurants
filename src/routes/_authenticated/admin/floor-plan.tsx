import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { TABLE_LOCATIONS, TABLE_STATUSES } from "@/lib/reservations.shared";
import { deleteTable, listFloorPlan, saveTable, setTableStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/floor-plan")({
  head: () => ({
    meta: [
      { title: "Floor Plan — Himalchuli Dashboard" },
      { name: "description", content: "Manage sections, tables, capacity and live table status." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Floor Plan — Himalchuli Dashboard" },
      { property: "og:description", content: "Manage sections, tables, capacity and live table status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FloorPlan,
});

const empty = {
  id: null as string | null,
  sectionId: null as string | null,
  tableNumber: "",
  name: "",
  capacity: 4,
  minimumGuests: 1,
  maximumGuests: 4,
  location: "indoor" as (typeof TABLE_LOCATIONS)[number]["value"],
  description: "",
  isActive: true,
};

function FloorPlan() {
  const qc = useQueryClient();
  const listFn = useServerFn(listFloorPlan);
  const saveFn = useServerFn(saveTable);
  const deleteFn = useServerFn(deleteTable);
  const statusFn = useServerFn(setTableStatus);
  const [form, setForm] = useState(empty);

  const floor = useQuery({ queryKey: ["floor-plan"], queryFn: () => listFn() });

  async function run(fn: () => Promise<unknown>, msg: string) {
    try {
      await fn();
      toast.success(msg);
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const sections = floor.data?.sections ?? [];
  const tables = floor.data?.tables ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Floor plan</h1>
        <p className="text-sm text-muted-foreground">Sections, tables, capacity rules and live status.</p>
      </header>

      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="mb-3 font-display text-lg font-bold uppercase tracking-wide">
            {section.name}
            <span className="ml-2 text-xs font-normal text-muted-foreground">{section.location}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tables
              .filter((t) => t.section_id === section.id)
              .map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl border p-4 ${t.is_active ? "border-border bg-card" : "border-dashed border-border bg-surface opacity-60"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-xl font-bold">{t.table_number}</div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{t.location}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t.name ?? "Table"} · seats {t.minimum_guests}–{t.maximum_guests}
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => run(() => statusFn({ data: { id: t.id, status: e.target.value } }), "Status updated")}
                    className="mt-3 w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    {TABLE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      onClick={() =>
                        setForm({
                          id: t.id,
                          sectionId: t.section_id,
                          tableNumber: t.table_number,
                          name: t.name ?? "",
                          capacity: t.capacity,
                          minimumGuests: t.minimum_guests,
                          maximumGuests: t.maximum_guests,
                          location: t.location as typeof empty.location,
                          description: t.description ?? "",
                          isActive: t.is_active,
                        })
                      }
                      className="rounded-md border border-border px-2 py-1 hover:border-primary hover:text-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => run(() => deleteFn({ data: { id: t.id } }), "Table deleted")}
                      className="rounded-md border border-border px-2 py-1 text-destructive hover:border-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}

      <form
        className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveFn({ data: form }), form.id ? "Table updated" : "Table added").then(() => setForm(empty));
        }}
      >
        <h2 className="sm:col-span-2 lg:col-span-4 font-display text-lg font-bold uppercase">
          {form.id ? "Edit table" : "Add table"}
        </h2>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Section</span>
          <select
            value={form.sectionId ?? ""}
            onChange={(e) => setForm({ ...form, sectionId: e.target.value || null })}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">Unassigned</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <Num label="Table number" value={form.tableNumber} onChange={(v) => setForm({ ...form, tableNumber: v })} text />
        <Num label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} text />
        <Num label="Capacity" value={String(form.capacity)} onChange={(v) => setForm({ ...form, capacity: Number(v) })} />
        <Num label="Min guests" value={String(form.minimumGuests)} onChange={(v) => setForm({ ...form, minimumGuests: Number(v) })} />
        <Num label="Max guests" value={String(form.maximumGuests)} onChange={(v) => setForm({ ...form, maximumGuests: Number(v) })} />
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Location</span>
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value as typeof form.location })}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            {TABLE_LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
          <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase text-primary-foreground">
            Save table
          </button>
          {form.id && (
            <button type="button" onClick={() => setForm(empty)} className="rounded-md border border-border px-5 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
  text,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  text?: boolean;
}) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={text ? "text" : "number"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
