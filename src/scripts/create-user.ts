import { createClient } from "@supabase/supabase-js";
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const { data } = await admin.auth.admin.createUser({
  email: "you@example.com",
  password: "temporary-strong-password",
  email_confirm: true,
});
// then the two inserts from Option B, using data.user.id