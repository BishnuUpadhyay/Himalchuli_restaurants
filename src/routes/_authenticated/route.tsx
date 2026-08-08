import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

// Auto sign-out after this much inactivity (mouse/keyboard/touch/scroll).
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/staff-login" });
    return { user: data.user };
  },
  component: AuthenticatedShell,
});

function AuthenticatedShell() {
  const navigate = useNavigate();

  // Session timeout: idle staff get signed out automatically.
  useIdleTimeout(IDLE_TIMEOUT_MS, () => {
    supabase.auth.signOut().finally(() => {
      navigate({ to: "/staff-login", replace: true });
    });
  });

  // Route protection: if the session ends for any reason (manual sign-out in
  // another tab, refresh-token failure because the token expired or the
  // account was disabled/banned by an owner, etc.) boot back to the login page
  // immediately instead of leaving a stale dashboard on screen.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: "/staff-login", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return <Outlet />;
}
