import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getMyAccess,
  getSettings,
  inviteStaff,
  listAuditLogs,
  listStaff,
  setStaffActive,
  setStaffRole,
  updateSettings,
} from "@/lib/admin.functions";

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
  const inviteFn = useServerFn(inviteStaff);
  const activeFn = useServerFn(setStaffActive);
  const accessFn = useServerFn(getMyAccess);

  const settings = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  const staff = useQuery({ queryKey: ["staff"], queryFn: () => staffFn(), retry: false });
  // Same queryKey as admin/route.tsx's layout query, so this reuses the cached result.
  const access = useQuery({ queryKey: ["my-access"], queryFn: () => accessFn() });
  const isOwner = access.data?.role === "owner";
  const [draft, setDraft] = useState<Settings | null>(null);
  const [invite, setInvite] = useState({ email: "", fullName: "", role: "staff" });
  const [inviteBusy, setInviteBusy] = useState(false);

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
        <p className="mb-4 text-xs text-muted-foreground">
          Owner → Manager → Staff. Only owners can invite people, change roles, or disable accounts.
          There's no public sign-up — every login is created here.
        </p>
        <ul className="mb-6 space-y-2 text-sm">
          {(staff.data ?? []).map((s) => (
            <li key={s.userId} className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2">
              <div>
                <div>{s.name || s.email}</div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {!s.active && (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                    Disabled
                  </span>
                )}
                {isOwner ? (
                  <select
                    value={s.role}
                    onChange={async (e) => {
                      try {
                        await roleFn({ data: { email: s.email ?? "", role: e.target.value } });
                        toast.success("Role updated");
                        qc.invalidateQueries();
                      } catch (err) {
                        toast.error((err as Error).message);
                      }
                    }}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs uppercase tracking-wider"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                ) : (
                  <span className="text-xs uppercase tracking-wider text-primary">{s.role}</span>
                )}
                {isOwner && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await activeFn({ data: { userId: s.userId, active: !s.active } });
                        toast.success(s.active ? "Staff account disabled" : "Staff account re-enabled");
                        qc.invalidateQueries();
                      } catch (err) {
                        toast.error((err as Error).message);
                      }
                    }}
                    className="rounded-md border border-border px-2 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-background"
                  >
                    {s.active ? "Disable" : "Enable"}
                  </button>
                )}
              </div>
            </li>
          ))}
          {staff.data?.length === 0 && <li className="text-muted-foreground">No staff yet.</li>}
        </ul>

        {isOwner && (
          <form
            className="flex flex-wrap gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setInviteBusy(true);
              try {
                await inviteFn({ data: invite });
                toast.success(`Invitation sent to ${invite.email}`);
                setInvite({ email: "", fullName: "", role: "staff" });
                qc.invalidateQueries();
              } catch (err) {
                toast.error((err as Error).message);
              } finally {
                setInviteBusy(false);
              }
            }}
          >
            <input
              type="text"
              required
              placeholder="Full name"
              value={invite.fullName}
              onChange={(e) => setInvite({ ...invite, fullName: e.target.value })}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
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
            <button
              disabled={inviteBusy}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase text-primary-foreground disabled:opacity-60"
            >
              {inviteBusy ? "Sending…" : "Send invite"}
            </button>
          </form>
        )}
      </section>

      <AuditLog visible={access.data?.role === "owner" || access.data?.role === "manager"} />
    </div>
  );
}

function AuditLog({ visible }: { visible: boolean }) {
  const logFn = useServerFn(listAuditLogs);
  const logs = useQuery({ queryKey: ["audit-logs"], queryFn: () => logFn(), enabled: visible });

  if (!visible) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 font-display text-lg font-bold uppercase">Audit log</h2>
      <p className="mb-4 text-xs text-muted-foreground">Recent staff and account changes.</p>
      <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
        {(logs.data ?? []).map((entry) => (
          <li key={entry.id} className="border-b border-border/60 pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{entry.action}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </div>
            {entry.details && Object.keys(entry.details as object).length > 0 && (
              <div className="text-xs text-muted-foreground">
                {JSON.stringify(entry.details)}
              </div>
            )}
          </li>
        ))}
        {logs.data?.length === 0 && <li className="text-muted-foreground">No activity yet.</li>}
      </ul>
    </section>
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
