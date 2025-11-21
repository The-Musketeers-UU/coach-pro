import { supabaseAuthRequest, supabaseRequest } from "./client";
import type { AthleteRow } from "./training-modules";

export type SignUpInput = {
  email: string;
  password: string;
  name?: string;
  isCoach?: boolean;
};

type SupabaseAuthUser = {
  id: string;
  email?: string | null;
};

type SupabaseAuthResponse = {
  user: SupabaseAuthUser | null;
};

export const signUpUser = async (
  input: SignUpInput,
): Promise<{ authUser: SupabaseAuthUser | null; profile: AthleteRow | null }> => {
  const authResponse = await supabaseAuthRequest<SupabaseAuthResponse>("signup", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
      data: input.name ? { name: input.name } : undefined,
    },
  });

  const sanitizedName = input.name?.trim();
  const payload = {
    name: sanitizedName && sanitizedName.length ? sanitizedName : input.email,
    email: input.email,
    isCoach: Boolean(input.isCoach),
  } satisfies Omit<AthleteRow, "id">;

  const [profile] = await supabaseRequest<AthleteRow[]>("user", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return { authUser: authResponse.user, profile: profile ?? null };
};
