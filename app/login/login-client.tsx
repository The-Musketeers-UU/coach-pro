"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type AuthMode = "signin" | "signup";

type AuthFormState = {
  email: string;
  password: string;
  name: string;
  isCoach: boolean;
};

const defaultFormState: AuthFormState = {
  email: "",
  password: "",
  name: "",
  isCoach: false,
};

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const { user, isLoading } = useAuth();
  const supabase = getSupabaseBrowserClient();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [formState, setFormState] = useState<AuthFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
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
    setMessage(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (signInError) throw signInError;
        setMessage("Signed in successfully. Redirecting...");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              name: formState.name.trim() || undefined,
              isCoach: formState.isCoach,
            },
          },
        });

        if (signUpError) throw signUpError;
        setMessage("Account created. Check your email to confirm if required.");
      }

      setFormState(defaultFormState);
      router.replace(redirectTo);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : String(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral">
            <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
            Supabase ready
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Sign in to keep your coaching momentum
            </h1>
            <p className="text-lg text-base-content/70">
              Secure access to Coach Pro with the Supabase-powered auth flow. Switch between athlete and coach views without losing your session.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Coach mode</p>
                <p className="text-lg font-semibold">Plan reusable modules and schedules</p>
                <p className="text-sm text-base-content/70">
                  Save blocks, assemble weeks, and reuse them across athletes with guided forms.
                </p>
              </div>
            </div>
            <div className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Athlete mode</p>
                <p className="text-lg font-semibold">Preview weekly work at a glance</p>
                <p className="text-sm text-base-content/70">
                  Toggle to the athlete view to see clean schedule summaries and day-by-day plans.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="card border border-base-300 bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                  {mode === "signin" ? "Login" : "Create account"}
                </p>
                <h2 className="text-2xl font-semibold">
                  {mode === "signin" ? "Enter your credentials" : "Start your account"}
                </h2>
                <p className="text-sm text-base-content/70">
                  Use your Supabase email + password. We&apos;ll keep you signed in across the app.
                </p>
              </div>

              <div className="tabs tabs-boxed">
                <button
                  className={`tab ${mode === "signin" ? "tab-active" : ""}`}
                  onClick={() => setMode("signin")}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={`tab ${mode === "signup" ? "tab-active" : ""}`}
                  onClick={() => setMode("signup")}
                  type="button"
                >
                  Sign up
                </button>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="form-control">
                <span className="label-text">Email</span>
                <input
                  type="email"
                  className="input input-bordered"
                  required
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="you@example.com"
                />
              </label>

              <label className="form-control">
                <span className="label-text">Password</span>
                <input
                  type="password"
                  className="input input-bordered"
                  required
                  minLength={6}
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, password: event.target.value }))
                  }
                  placeholder="••••••••"
                />
              </label>

              {mode === "signup" && (
                <label className="form-control">
                  <span className="label-text">Full name (optional)</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Alex Coachman"
                  />
                </label>
              )}

              {mode === "signup" && (
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={formState.isCoach}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, isCoach: event.target.checked }))
                    }
                  />
                  <span className="label-text">I&apos;m signing up as a coach</span>
                </label>
              )}

              <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Working..." : mode === "signin" ? "Login" : "Create account"}
              </button>
              <p className="text-xs text-base-content/60">
                By continuing, you agree to store your session in Supabase for a smoother builder experience.
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
