"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ensureUserForAuth } from "@/lib/supabase/training-modules";

export default function ForgotPassPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ForgotPassword />
    </Suspense>
  );
}

function ForgotPassword() {
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

      const sessionResponse = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? sessionResponse.data.session?.user;
      const accessToken = data.session?.access_token ?? sessionResponse.data.session?.access_token;
      const authUser = data.user ?? sessionUser;

      const requiresEmailVerification = !data.session && !sessionResponse.data.session;

      if (requiresEmailVerification) {
        router.replace(`/login?verificationPending=1&redirectTo=${encodeURIComponent(redirectTo)}`);
        return;
      }

      if (authUser) {
        await ensureUserForAuth(authUser, accessToken);
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
      <div className="card bg-base-100 shadow-xl w:[80vw] sm:w-md">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">återställ lösenord</h1>

          {error && <div className="alert alert-error mt-2">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
        

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
