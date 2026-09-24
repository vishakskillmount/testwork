import { SupabaseClient, createClient } from "@supabase/supabase-js";

import { env } from "@/server/config/env";

const globalForSupabase = globalThis as typeof globalThis & {
  _supabaseClient?: SupabaseClient;
};

export function getSupabaseClient(): SupabaseClient {
  if (!globalForSupabase._supabaseClient) {
    globalForSupabase._supabaseClient = createClient(
      env.supabaseUrl,
      env.supabaseKey
    );
  }

  return globalForSupabase._supabaseClient;
}
