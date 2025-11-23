"use client";

export default function DebugEnv() {
  return (
    <pre>
      {JSON.stringify(
        {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          service: process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        null,
        2
      )}
    </pre>
  );
}
