import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CalendarRange,
  ClipboardList,
  Grid3x3,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/admin", label: "Today", icon: LayoutDashboard, exact: true },
  { to: "/admin/reservations", label: "Reservations", icon: ClipboardList },
  { to: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { to: "/admin/floor-plan", label: "Floor plan", icon: Grid3x3 },
  { to: "/admin/waitlist", label: "Waitlist", icon: ListOrdered },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accessFn = useServerFn(getMyAccess);
  const access = useQuery({ queryKey: ["my-access"], queryFn: () => accessFn() });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/staff-login", replace: true });
  }

  if (access.isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  if (!access.data?.role) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">No access yet</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account ({access.data?.email}) isn't linked to a staff role. Ask the restaurant owner to grant
          you access from Settings → Team.
        </p>
        <button onClick={signOut} className="mt-6 rounded-md border border-border px-4 py-2 text-sm">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface p-4 md:block">
        <div className="px-2 pb-6">
          <div className="font-display text-lg font-bold uppercase tracking-wide">Himalchuli</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary">Reservation desk</div>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-card"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="px-3">{access.data.email}</div>
          <div className="px-3 uppercase tracking-wider text-primary">{access.data.role}</div>
          <button
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-card"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-2 overflow-x-auto border-b border-border bg-surface p-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
