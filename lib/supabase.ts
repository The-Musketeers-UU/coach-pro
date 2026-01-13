import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_AUTH_CONFIG,
  SUPABASE_URL,
  warnIfSupabaseEnvMissing,
} from "@/lib/supabase/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

let cachedClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (cachedClient) return cachedClient;

  if (typeof window !== "undefined") {
    cachedClient = getSupabaseBrowserClient();
    return cachedClient;
  }

  warnIfSupabaseEnvMissing();
  cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: SUPABASE_AUTH_CONFIG,
  });

  return cachedClient;
};

export const supabase = getSupabaseClient();
