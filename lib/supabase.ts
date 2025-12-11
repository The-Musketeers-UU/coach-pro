import { createClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_AUTH_CONFIG,
  SUPABASE_URL,
} from "@/lib/supabase/config";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: SUPABASE_AUTH_CONFIG,
});
