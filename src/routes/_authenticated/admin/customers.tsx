import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Himalchuli Dashboard" },
      { name: "description", content: "Guest profiles, visit history, preferences and no-show records." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Customers — Himalchuli Dashboard" },
      { property: "og:description", content: "Guest profiles, visit history and no-show records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Customers,
});

function Customers() {
  const [search, setSearch] = useState("");
  const fn = useServerFn(listCustomers);
  const list = useQuery({ queryKey: ["customers", search], queryFn: () => fn({ data: { search } }) });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Customers</h1>
        <p className="text-sm text-muted-foreground">Automatic guest profiles built from every booking.</p>
      </header>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search name, phone or email"
        className="w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Guest</th>
              <th className="p-3">Visits</th>
              <th className="p-3">Completed</th>
              <th className="p-3">No-shows</th>
              <th className="p-3">Last visit</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.phone} {c.email ? `· ${c.email}` : ""}
                  </div>
                </td>
                <td className="p-3">{c.totalReservations}</td>
                <td className="p-3">{c.completedVisits}</td>
                <td className="p-3">{c.noShows}</td>
                <td className="p-3">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No guests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
