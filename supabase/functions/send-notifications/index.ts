// Supabase Edge Function: send-notifications
//
// Drains the `notifications` queue (written by queueNotification() in
// src/lib/reservation-engine.server.ts) and actually sends "email" channel
// rows via Resend. "sms"/"whatsapp" rows are marked "skipped" since no SMS
// provider is wired up yet — see the bottom of this file for how to add one.
//
// Deploy:
//   supabase functions deploy send-notifications
//   supabase secrets set RESEND_API_KEY=re_xxx RESEND_FROM="Himalchuli Bar & Grill <reservations@yourdomain.com>"
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by the
// Supabase platform for every Edge Function — you don't need to set those.
//
// This function is meant to be called on a schedule (see the pg_cron
// migration alongside this file), not directly by the browser.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 25;

Deno.serve(async (_req: Request) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const RESEND_FROM = Deno.env.get("RESEND_FROM");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }
  if (!RESEND_API_KEY || !RESEND_FROM) {
    return json({ error: "Missing RESEND_API_KEY/RESEND_FROM secrets. Run `supabase secrets set`." }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: rows, error } = await supabase
    .from("notifications")
    .select("id, channel, type, recipient, subject, body")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) return json({ error: error.message }, 500);
  if (!rows || rows.length === 0) return json({ sent: 0, failed: 0, skipped: 0 });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.channel !== "email") {
      // No SMS/WhatsApp provider configured yet — mark as skipped instead of
      // silently retrying forever. Wire up Twilio (or similar) here later.
      await supabase
        .from("notifications")
        .update({ status: "skipped", error: `No provider configured for channel "${row.channel}"` })
        .eq("id", row.id);
      skipped++;
      continue;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [row.recipient],
          subject: row.subject ?? "Himalchuli Bar & Grill",
          text: row.body ?? "",
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Resend ${res.status}: ${detail}`);
      }

      await supabase
        .from("notifications")
        .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
        .eq("id", row.id);
      sent++;
    } catch (err) {
      await supabase
        .from("notifications")
        .update({ status: "failed", error: String((err as Error).message ?? err) })
        .eq("id", row.id);
      failed++;
    }
  }

  return json({ sent, failed, skipped, total: rows.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });// Supabase Edge Function: send-notifications
//
// Drains the `notifications` queue (written by queueNotification() in
// src/lib/reservation-engine.server.ts) and sends "email" channel rows
// (booking confirmations, reminders, admin alerts, etc.) over plain SMTP.
// "sms"/"whatsapp" rows are marked "skipped" since no SMS provider is wired
// up yet — see the bottom of this file for how to add one.
//
// Deploy:
//   supabase functions deploy send-notifications
//   supabase secrets set \
//     SMTP_HOST=smtp.yourprovider.com \
//     SMTP_PORT=587 \
//     SMTP_USER=reservations@yourdomain.com \
//     SMTP_PASS=your-smtp-password-or-app-password \
//     SMTP_FROM="Himalchuli Bar & Grill <reservations@yourdomain.com>"
//
// Notes on SMTP_PORT:
//   - 465 -> implicit TLS (connection is encrypted from the start)
//   - 587 -> STARTTLS (connection starts plain, then upgrades) — most common
//   - 25  -> usually blocked by cloud providers, avoid
//
// If you're using Gmail: enable 2FA on the account, then create an "App
// Password" (Google Account -> Security -> App passwords) and use that as
// SMTP_PASS. Host is smtp.gmail.com, port 587.
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by
// the Supabase platform for every Edge Function — you don't need to set
// those.
//
// This function is meant to be called on a schedule (see the pg_cron
// migration alongside this file), not directly by the browser.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const BATCH_SIZE = 25;

Deno.serve(async (_req: Request) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "587");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASS = Deno.env.get("SMTP_PASS");
  const SMTP_FROM = Deno.env.get("SMTP_FROM") ?? SMTP_USER;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return json(
      { error: "Missing SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM secrets. Run `supabase secrets set`." },
      500,
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: rows, error } = await supabase
    .from("notifications")
    .select("id, channel, type, recipient, subject, body")
    .eq("status", "queued")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) return json({ error: error.message }, 500);
  if (!rows || rows.length === 0) return json({ sent: 0, failed: 0, skipped: 0 });

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: SMTP_PORT === 465, // implicit TLS on 465; denomailer STARTTLS-upgrades 587 automatically
      auth: { username: SMTP_USER, password: SMTP_PASS },
    },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.channel !== "email") {
      // No SMS/WhatsApp provider configured yet — mark as skipped instead of
      // silently retrying forever. Wire up Twilio (or similar) here later.
      await supabase
        .from("notifications")
        .update({ status: "skipped", error: `No provider configured for channel "${row.channel}"` })
        .eq("id", row.id);
      skipped++;
      continue;
    }

    try {
      await client.send({
        from: SMTP_FROM,
        to: row.recipient,
        subject: row.subject ?? "Himalchuli Bar & Grill",
        content: row.body ?? "",
      });

      await supabase
        .from("notifications")
        .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
        .eq("id", row.id);
      sent++;
    } catch (err) {
      await supabase
        .from("notifications")
        .update({ status: "failed", error: String((err as Error).message ?? err) })
        .eq("id", row.id);
      failed++;
    }
  }

  try {
    await client.close();
  } catch {
    // connection may already be closed by the underlying socket; safe to ignore
  }

  return json({ sent, failed, skipped, total: rows.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
}
