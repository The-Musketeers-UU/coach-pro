"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const resolveRedirectPath = (value: string | null) => {
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
};

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
  const redirectTo = resolveRedirectPath(searchParams.get("redirectTo"));

  const supabase = getSupabaseBrowserClient();
  const { user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const redirectUrl = new URL("/reset-password", window.location.origin);
      redirectUrl.searchParams.set("redirectTo", redirectTo);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl.toString(),
      });

      if (resetError) throw resetError;

      setMessage("If an account exists for this email, a reset link is on the way.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : String(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl w:[80vw] sm:w-md">
        <div className="card-body space-y-3">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold">Reset password</h1>
            <p className="text-sm text-base-content/70">
              Enter your email and we will send a reset link.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-info">{message}</div>}

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
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </div>
          </form>

          <p className="text-center text-sm">
            Already have an account?{" "}
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
