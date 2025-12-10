"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const { user, isLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      router.replace(redirectTo);
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
        </div>
      </div>
    </main>
  );
}
