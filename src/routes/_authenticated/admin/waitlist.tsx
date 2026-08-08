import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { formatTimeLabel } from "@/lib/reservations.shared";
import { listWaitlist, updateWaitlist } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/waitlist")({
  head: () => ({
    meta: [
      { title: "Waitlist — Himalchuli Dashboard" },
      { name: "description", content: "Manage the live waitlist and notify guests when tables open." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Waitlist — Himalchuli Dashboard" },
      { property: "og:description", content: "Manage the live waitlist and notify guests when tables open." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Waitlist,
});

function Waitlist() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWaitlist);
  const updateFn = useServerFn(updateWaitlist);
  const list = useQuery({ queryKey: ["waitlist"], queryFn: () => listFn(), refetchInterval: 30000 });

  async function set(id: string, status: string) {
    try {
      await updateFn({ data: { id, status } });
      toast.success("Waitlist updated");
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Waitlist</h1>
        <p className="text-sm text-muted-foreground">Notify guests by SMS the moment a table frees up.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Guest</th>
              <th className="p-3">Party</th>
              <th className="p-3">Preferred</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((w) => (
              <tr key={w.id} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.phone}</div>
                  {w.notes && <div className="text-xs italic text-muted-foreground">{w.notes}</div>}
                </td>
                <td className="p-3">{w.guests}</td>
                <td className="p-3">
                  {w.date} · {formatTimeLabel(w.time)}
                </td>
                <td className="p-3 uppercase text-xs tracking-wider">{w.status}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {["notified", "seated", "cancelled", "expired"].map((s) => (
                      <button
                        key={s}
                        onClick={() => set(w.id, s)}
                        className="rounded-md border border-border px-2 py-1 text-xs hover:border-primary hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Nobody is waiting right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
