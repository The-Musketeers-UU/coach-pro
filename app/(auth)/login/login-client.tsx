"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ensureUserForAuth } from "@/lib/supabase/training-modules";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const verificationPending = searchParams.get("verificationPending") === "1";

  const { user, isLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveRedirectTarget = (target: string, isCoach: boolean | null) => {
    if (target === "/" && isCoach !== null) {
      return isCoach ? "/dashboard" : "/athlete";
    }

    if (target === "/athlete" && isCoach) {
      return "/dashboard";
    }

    return target;
  };

  useEffect(() => {
    if (!isLoading && user) {
      const isCoach =
        typeof user.user_metadata?.isCoach === "boolean"
          ? user.user_metadata.isCoach
          : null;
      router.replace(resolveRedirectTarget(redirectTo, isCoach));
    }
  }, [user, isLoading, router, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      const sessionResponse = await supabase.auth.getSession();
      const user = signInData.session?.user ?? sessionResponse.data.session?.user;
      const accessToken = signInData.session?.access_token ?? sessionResponse.data.session?.access_token;

      if (user) {
        const profile = await ensureUserForAuth(user, accessToken);
        router.replace(resolveRedirectTarget(redirectTo, profile.isCoach));
        return;
      }
      router.replace(resolveRedirectTarget(redirectTo, null));
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : String(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center bg-base-200">
      <div className="card sm:w-md w:[80vw] bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold">Logga in</h1>
            <p className="text-sm text-base-content/70">Välkommen tillbaka 👋</p>
          </div>

          {verificationPending && (
            <div className="alert alert-info">
              <span>
                Ditt konto är skapat. Kontrollera din e-post för att bekräfta ditt konto innan du
                loggar in.
              </span>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

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

            <div className="form-control mt-2 pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Loggar in..." : "Logga in"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm">
            Har du inget konto?{" "}
            <Link href="/register" className="link link-primary">
              Skapa ett konto
            </Link>
</p>
             <p className="text-center text-sm">
               <Link href="/forgot-password" className="link link-primary">
            Glömt lösenordet?{" "}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
