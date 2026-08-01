import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "./admin";

// Verifies the caller is the admin: reads the Bearer access token, validates it
// against Supabase, and checks the email. Admin routes use the service role
// (bypasses RLS), so they MUST gate on this before doing anything.
export async function verifyAdmin(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;

  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return false;
  return data.user.email.toLowerCase() === ADMIN_EMAIL;
}
