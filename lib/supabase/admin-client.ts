import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "@/lib/supabase/config";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cachedAdminClient: SupabaseClient | null = null;

export const getSupabaseAdminClient = (): SupabaseClient => {
  if (cachedAdminClient) return cachedAdminClient;

  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it to enable server-side profile creation.",
    );
  }

  cachedAdminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
};
