#!/usr/bin/env node
// create-owner.mjs
//
// One-off bootstrap script: creates a Supabase Auth user and grants it the
// "owner" role directly, bypassing the normal invite flow (which requires an
// existing owner). Use this ONCE to create your first super-admin account.
//
// Requires env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   <-- service role key, NEVER expose this client-side
//
// Usage:
//   node create-owner.mjs --email you@example.com --password "Str0ng!Pass" --name "Your Name"
//
// Or interactively (it will prompt for anything missing):
//   node create-owner.mjs
//
// Install the one dependency first if you don't already have it:
//   npm install @supabase/supabase-js

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Must match the RESTAURANT id used throughout src/lib/admin.functions.ts
const RESTAURANT_ID = "11111111-1111-4111-8111-111111111111";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--email") out.email = args[++i];
    else if (arg === "--password") out.password = args[++i];
    else if (arg === "--name") out.name = args[++i];
    else if (arg === "--force") out.force = true;
  }
  return out;
}

async function prompt(rl, question, { secret = false } = {}) {
  if (!secret) return (await rl.question(question)).trim();
  // Basic masked input for password (no external deps).
  return new Promise((resolve) => {
    output.write(question);
    let value = "";
    input.setRawMode(true);
    input.resume();
    input.setEncoding("utf8");
    const onData = (char) => {
      char = char.toString();
      if (char === "\n" || char === "\r" || char === "\u0004") {
        input.setRawMode(false);
        input.pause();
        input.removeListener("data", onData);
        output.write("\n");
        resolve(value.trim());
      } else if (char === "\u0003") {
        process.exit(1);
      } else if (char === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += char;
      }
    };
    input.on("data", onData);
  });
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.",
    );
    process.exit(1);
  }

  const args = parseArgs();
  const rl = readline.createInterface({ input, output });

  const email = args.email || (await prompt(rl, "Owner email: "));
  const name = args.name || (await prompt(rl, "Full name: "));
  let password = args.password;
  if (!password) {
    password = await prompt(rl, "Password (min 8 chars, hidden): ", { secret: true });
    const confirm = await prompt(rl, "Confirm password: ", { secret: true });
    if (password !== confirm) {
      console.error("Passwords don't match.");
      rl.close();
      process.exit(1);
    }
  }
  rl.close();

  if (!email || !email.includes("@")) {
    console.error("A valid email is required.");
    process.exit(1);
  }
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Safety check: warn (but allow --force) if owners already exist, since the
  // normal path for adding more staff after that point is the in-app invite flow.
  const { count: existingRoles, error: countErr } = await admin
    .from("user_roles")
    .select("id", { count: "exact", head: true });
  if (countErr) {
    console.error("Could not check existing roles:", countErr.message);
    process.exit(1);
  }
  if ((existingRoles ?? 0) > 0 && !args.force) {
    console.error(
      `This project already has ${existingRoles} role assignment(s). ` +
        "If you really want to force-create another owner, re-run with --force. " +
        "Otherwise, sign in as an existing owner and use Settings → Team → Send invite instead.",
    );
    process.exit(1);
  }

  console.log(`Creating auth user for ${email}...`);
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the confirmation email, log in immediately
    user_metadata: { full_name: name },
  });
  if (createErr) {
    console.error("Failed to create user:", createErr.message);
    process.exit(1);
  }

  const userId = created.user.id;
  console.log(`Auth user created (id: ${userId}). Assigning owner role...`);

  const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: "owner" });
  if (roleErr) {
    console.error("Failed to insert user_roles row:", roleErr.message);
    process.exit(1);
  }

  const { error: staffErr } = await admin.from("staff_members").insert({
    user_id: userId,
    restaurant_id: RESTAURANT_ID,
    email,
    full_name: name || email,
    is_active: true,
  });
  if (staffErr) {
    console.error("Failed to insert staff_members row:", staffErr.message);
    process.exit(1);
  }

  await admin.from("audit_logs").insert({
    actor_id: userId,
    actor_label: "bootstrap-script",
    action: "staff.bootstrap_owner",
    entity: "staff_member",
    entity_id: userId,
    details: { email, source: "create-owner.mjs" },
  });

  console.log("\nDone. You can now sign in at /staff-login with:");
  console.log(`  email:    ${email}`);
  console.log(`  password: (the one you just set)`);
  console.log("\nConsider rotating that password via 'Forgot your password?' once you've logged in.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
