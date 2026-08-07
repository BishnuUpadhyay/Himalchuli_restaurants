-- Actually invoke the send-notifications Edge Function on a schedule.
-- Without this, rows written by queueNotification() just sit in the
-- `notifications` table forever with status = 'queued' — nothing ever
-- sends them.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- One-time manual step (run in the SQL editor, NOT committed to a migration
-- so the key never lands in git history):
--   select vault.create_secret('<your service_role key>', 'service_role_key');

SELECT cron.schedule(
  'invoke-send-notifications',
  '*/2 * * * *', -- every 2 minutes
  $$
  SELECT net.http_post(
    url := 'https://ngtakwsqfjtpmbqdjlml.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
