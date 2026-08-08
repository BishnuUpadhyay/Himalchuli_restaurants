import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set Password — Himalchuli Reservations" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

// Landing page for both: (1) an owner's staff invite email, and (2) a "forgot
// password" email. Supabase turns either link into a temporary recovery session
// on load; this page just lets the person set a real password for that session.
function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Supabase's client parses the recovery token out of the URL fragment and
    // establishes a session automatically (detectSessionInUrl is on by default).
    // Give it a moment, then check whether we actually got a session.
    supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStatus("ready");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setStatus(data.session ? "ready" : "invalid");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password set. Welcome in.");
      navigate({ to: "/admin" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl">
        <img src={logo} alt="Himalchuli Bar & Grill" className="mx-auto h-16 w-16 rounded-full object-cover" />
        <h1 className="mt-4 text-center font-display text-2xl font-bold uppercase tracking-wide">
          Set Your Password
        </h1>

        {status === "checking" && (
          <p className="mt-8 text-center text-sm text-muted-foreground">Verifying your link…</p>
        )}

        {status === "invalid" && (
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              This link is invalid or has expired. Request a new one from the sign-in page.
            </p>
            <a
              href="/staff-login"
              className="inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              Back to sign in
            </a>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                New password
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm password
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
