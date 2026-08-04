// Server-only role helpers for the admin dashboard.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AppRole = "owner" | "manager" | "staff";

// Resolves the caller's role. Returns null (no access) if the account has no
// role assigned yet, OR if an owner has disabled the linked staff_members row.
// This is the single choke point enforcing "disabled staff can't do anything",
// even if their Supabase session/JWT is still technically valid.
export async function getRole(userId: string): Promise<AppRole | null> {
  const { data: staff } = await supabaseAdmin
    .from("staff_members")
    .select("is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (staff && staff.is_active === false) return null;

  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as AppRole);
  if (roles.includes("owner")) return "owner";
  if (roles.includes("manager")) return "manager";
  if (roles.includes("staff")) return "staff";
  return null;
}

export async function requireStaff(userId: string): Promise<AppRole> {
  const role = await getRole(userId);
  if (!role) throw new Error("Forbidden: your account has no staff access, or it has been disabled.");
  return role;
}

export async function requireManager(userId: string): Promise<AppRole> {
  const role = await requireStaff(userId);
  if (role === "staff") throw new Error("Forbidden: managers and owners only.");
  return role;
}

export async function requireOwner(userId: string): Promise<AppRole> {
  const role = await requireStaff(userId);
  if (role !== "owner") throw new Error("Forbidden: owners only.");
  return role;
}
