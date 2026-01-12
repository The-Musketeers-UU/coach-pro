export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "development-anon-key";

export const SUPABASE_AUTH_CONFIG = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
} as const;

export const warnIfSupabaseEnvMissing = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      "Supabase environment variables are missing. Using placeholder credentials for local development. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for real authentication.",
    );
  }
};
