// Separate client and server implementations

// For CLIENT-SIDE usage (components, pages)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type SupabaseRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string>;
  prefer?: string;
  accessToken?: string; // User's access token
};

const buildRestUrl = (path: string, searchParams?: Record<string, string>) => {
  if (!SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  const url = new URL(`/rest/v1/${path}`, SUPABASE_URL);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url;
};

export const supabaseRequest = async <T>(
  path: string,
  options: SupabaseRequestOptions,
): Promise<T> => {
  if (!SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.");
  }

  // IMPORTANT: Use user's access token if provided, otherwise anon key
  const authToken = options.accessToken ?? SUPABASE_ANON_KEY;

  const url = buildRestUrl(path, options.searchParams);
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY, // Always use anon key for apikey header
      Authorization: `Bearer ${authToken}`, // Use user token or anon key
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Supabase request failed (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};