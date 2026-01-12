import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { AthleteRow } from "@/lib/supabase/training-modules";

const isValidEmail = (email: unknown): email is string =>
  typeof email === "string" && email.includes("@");

export async function POST(request: Request) {
  try {
    const { id, email, name, isCoach, accessToken } = (await request.json()) as {
      id?: unknown;
      email?: unknown;
      name?: unknown;
      isCoach?: unknown;
      accessToken?: unknown;
    };

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Missing user id." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "A valid email is required." }, { status: 400 });
    }

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    if (typeof accessToken !== "string" || !accessToken) {
      return NextResponse.json({ message: "Missing access token for validation." }, { status: 401 });
    }

    const adminClient = getSupabaseAdminClient();
    const { data: authUser, error: userError } = await adminClient.auth.getUser(accessToken);

    if (userError || !authUser) {
      return NextResponse.json({ message: "Unable to validate access token." }, { status: 401 });
    }

    if (authUser.user.id !== id) {
      return NextResponse.json({ message: "Authenticated user does not match profile id." }, { status: 403 });
    }

    const { data: createdUser, error } = await adminClient
      .from("user")
      .upsert(
        {
          id,
          email: email.trim(),
          name: name.trim(),
          isCoach: Boolean(isCoach),
        },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message ?? "Failed to create user." }, { status: 400 });
    }

    return NextResponse.json(createdUser as AthleteRow);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create profile.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
