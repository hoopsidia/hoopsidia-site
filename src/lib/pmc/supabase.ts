import { createClient } from "@supabase/supabase-js";

// Browser client — publishable (anon) key, RLS-gated. Safe to ship to the
// client; it can only read the `terrains_public` view (validated courts,
// public columns). All writes go through server routes with the service role.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
