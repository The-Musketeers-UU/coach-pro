"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const MIN_PASSWORD_LENGTH = 8;

const resolveRedirectPath = (value: string | null) => {
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const redirectTo = resolveRedirectPath(searchParams.get("redirectTo"));

  const supabase = getSupabaseBrowserClient();
  const { user, isLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = useMemo(() => !isLoading && Boolean(user), [isLoading, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!user) {
      setError("Open the reset link from your email to set a new password.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Password updated. You can now sign in.");
      setPassword("");
      setPasswordConfirm("");
    } catch (updatePasswordError) {
      setError(
        updatePasswordError instanceof Error
          ? updatePasswordError.message
          : String(updatePasswordError),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl w:[80vw] sm:w-md">
        <div className="card-body space-y-3">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold">Set a new password</h1>
            <p className="text-sm text-base-content/70">
              Choose a strong password for your account.
            </p>
          </div>

          {!isLoading && !user && (
            <div className="alert alert-info">
              Use the link in your reset email to access this page.
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label" htmlFor="new-password">
                <span className="label-text">New password</span>
              </label>
              <input
                id="new-password"
                type="password"
                className="input input-bordered w-full"
                placeholder="********"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={!isReady}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="confirm-password">
                <span className="label-text">Confirm password</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input input-bordered w-full"
                placeholder="********"
                required
                minLength={MIN_PASSWORD_LENGTH}
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                disabled={!isReady}
              />
            </div>

            <div className="form-control mt-2 pt-2">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting || !isReady}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2 text-center text-sm">
            {message && (
              <Link href={redirectTo} className="link link-primary">
                Continue to the app
              </Link>
            )}
            <Link href="/login" className="link link-primary">
              Back to login
            </Link>
          </div>
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
