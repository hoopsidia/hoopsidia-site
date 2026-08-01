"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client-side auth session (magic link). Separate from the read-only map
// client because this one persists the session and exchanges the code in the
// URL after the magic link returns.
let client: SupabaseClient | null = null;

export function getSupabaseAuth(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
  return client;
}
