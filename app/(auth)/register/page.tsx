"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ensureUserForAuth } from "@/lib/supabase/training-modules";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const supabase = getSupabaseBrowserClient();
  const { user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"aktiv" | "coach">("aktiv");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim() || undefined,
            isCoach: role === "coach",
          },
        },
      });

      if (signUpError) throw signUpError;
      const sessionUser =
        data.session?.user ?? (await supabase.auth.getSession()).data.session?.user;

      if (sessionUser) {
        await ensureUserForAuth(sessionUser);
      }
      router.replace(redirectTo);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : String(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex items-center justify-center bg-base-200">
      <div className="card w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Skapa konto</h1>

          {error && <div className="alert alert-error mt-2">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Namn</span>
              </label>
              <input
                type="text"
                placeholder="För- och efternamn"
                className="input input-bordered w-full"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">E-post</span>
              </label>
              <input
                type="email"
                placeholder="du@exempel.se"
                className="input input-bordered w-full"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Lösenord</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text pb-2">Registrera dig som</span>
              </label>

              <div className="flex items-center gap-4">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    value="aktiv"
                    checked={role === "aktiv"}
                    onChange={() => setRole("aktiv")}
                  />
                  <span className="label-text">Aktiv</span>
                </label>

                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    value="coach"
                    checked={role === "coach"}
                    onChange={() => setRole("coach")}
                  />
                  <span className="label-text">Coach</span>
                </label>
              </div>
            </div>

            <div className="form-control mt-2 pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Skapar..." : "Skapa konto"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
            Har du redan ett konto?{" "}
            <Link href="/login" className="link link-primary">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <span className="loading loading-spinner loading-lg text-primary" aria-label="Laddar" />
    </main>
  );
}
