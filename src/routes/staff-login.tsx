import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/staff-login")({
  head: () => ({
    meta: [
      { title: "Staff Login — Himalchuli Reservations" },
      { name: "description", content: "Sign in to the Himalchuli Bar & Grill reservation dashboard." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff Login — Himalchuli Reservations" },
      { property: "og:description", content: "Restaurant staff access to the reservation dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StaffLogin,
});

// NOTE: There is no public registration. Staff accounts only ever get created by
// an owner via Settings → Team, which sends an email invite (see inviteStaff in
// admin.functions.ts). This page only signs people in, or lets them request a
// password reset email for an account that already exists.
function StaffLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      // Deliberately vague so this can't be used to enumerate staff emails.
      toast.success("If that email has an account, a reset link is on its way.");
      setMode("signin");
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
          Reservation Desk
        </h1>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.3em] text-primary">Staff access</p>

        {mode === "signin" ? (
          <>
            <form onSubmit={handleSignIn} className="mt-8 space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-3"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-3"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Please wait…" : "Sign in"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="mt-4 w-full text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Forgot your password?
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
              <p className="text-xs text-muted-foreground">
                Enter the email your account was set up with and we'll send a link to reset your password.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-4 py-3"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-md bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Please wait…" : "Send reset link"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setMode("signin")}
              className="mt-4 w-full text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
