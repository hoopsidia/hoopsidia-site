import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client — service (secret) key, bypasses RLS. Used by route
// handlers for signalements, kit requests, confirmations and the back-office.
// Never import this from a client component. Throws if the secret is missing so
// misconfiguration fails loudly rather than silently writing nothing.
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    throw new Error(
      "Supabase admin non configuré : renseigne NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local",
    );
  }
  return createClient(url, secret, { auth: { persistSession: false } });
}
