import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getSettings, listStaff, setStaffRole, updateSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Himalchuli Dashboard" },
      { name: "description", content: "Opening hours, booking rules, capacity limits and staff roles." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Settings — Himalchuli Dashboard" },
      { property: "og:description", content: "Opening hours, booking rules, capacity limits and staff roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

type Settings = Awaited<ReturnType<typeof getSettings>>;

function Settings() {
  const qc = useQueryClient();
  const getFn = useServerFn(getSettings);
  const saveFn = useServerFn(updateSettings);
  const staffFn = useServerFn(listStaff);
  const roleFn = useServerFn(setStaffRole);

  const settings = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => staffFn(), retry: false });
  const [draft, setDraft] = useState<Settings | null>(null);
  const [invite, setInvite] = useState({ email: "", role: "staff" });

  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  if (!draft) return <p className="text-sm text-muted-foreground">Loading settings…</p>;

  async function save() {
    try {
      await saveFn({ data: draft });
      toast.success("Settings saved");
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Settings</h1>
        <p className="text-sm text-muted-foreground">Booking rules that power the availability engine.</p>
      </header>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold uppercase">Opening hours</h2>
        <div className="space-y-2">
          {Object.entries(draft.openingHours).map(([day, h]) => (
            <div key={day} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="w-24 capitalize">{day}</span>
              <input
                type="time"
                value={h.open}
                onChange={(e) =>
                  setDraft({ ...draft, openingHours: { ...draft.openingHours, [day]: { ...h, open: e.target.value } } })
                }
                className="rounded-md border border-border bg-background px-2 py-1"
              />
              <input
                type="time"
                value={h.close}
                onChange={(e) =>
                  setDraft({ ...draft, openingHours: { ...draft.openingHours, [day]: { ...h, close: e.target.value } } })
                }
                className="rounded-md border border-border bg-background px-2 py-1"
              />
              <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <input
                  type="checkbox"
                  checked={h.closed}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      openingHours: { ...draft.openingHours, [day]: { ...h, closed: e.target.checked } },
                    })
                  }
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="sm:col-span-2 lg:col-span-4 font-display text-lg font-bold uppercase">Booking rules</h2>
        <NumField label="Duration (min)" value={draft.defaultDurationMinutes} onChange={(v) => setDraft({ ...draft, defaultDurationMinutes: v })} />
        <NumField label="Buffer (min)" value={draft.bufferMinutes} onChange={(v) => setDraft({ ...draft, bufferMinutes: v })} />
        <NumField label="Slot interval (min)" value={draft.slotIntervalMinutes} onChange={(v) => setDraft({ ...draft, slotIntervalMinutes: v })} />
        <NumField label="Max covers / slot" value={draft.maxCoversPerSlot} onChange={(v) => setDraft({ ...draft, maxCoversPerSlot: v })} />
        <NumField label="Max party size" value={draft.maxPartySize} onChange={(v) => setDraft({ ...draft, maxPartySize: v })} />
        <NumField label="Advance days" value={draft.advanceBookingDays} onChange={(v) => setDraft({ ...draft, advanceBookingDays: v })} />
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" checked={draft.autoConfirm} onChange={(e) => setDraft({ ...draft, autoConfirm: e.target.checked })} />
          Auto-confirm bookings
        </label>
        <label className="text-sm sm:col-span-2 lg:col-span-4">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Cancellation policy</span>
          <textarea
            rows={2}
            value={draft.cancellationPolicy}
            onChange={(e) => setDraft({ ...draft, cancellationPolicy: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2 lg:col-span-4">
          <button onClick={save} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase text-primary-foreground">
            Save settings
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-bold uppercase">Team</h2>
        <ul className="mb-4 space-y-2 text-sm">
          {(staff.data ?? []).map((s) => (
            <li key={s.userId} className="flex justify-between border-b border-border/60 pb-2">
              <span>{s.email}</span>
              <span className="uppercase text-xs tracking-wider text-primary">{s.role}</span>
            </li>
          ))}
        </ul>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await roleFn({ data: invite });
              toast.success("Role assigned");
              qc.invalidateQueries();
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        >
          <input
            type="email"
            required
            placeholder="staff@email.com"
            value={invite.email}
            onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={invite.role}
            onChange={(e) => setInvite({ ...invite, role: e.target.value })}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
          </select>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase text-primary-foreground">
            Assign role
          </button>
        </form>
      </section>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
