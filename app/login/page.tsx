"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { supabaseBrowserClient } from "@/lib/supabase/browser-client";

type AuthMode = "signin" | "signup";

type AuthFormState = {
  email: string;
  password: string;
  name: string;
};

const defaultFormState: AuthFormState = {
  email: "",
  password: "",
  name: "",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const { user, isLoading } = useAuth();

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
        const { error: signInError } = await supabaseBrowserClient.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (signInError) throw signInError;
        setMessage("Signed in successfully. Redirecting...");
      } else {
        const { error: signUpError } = await supabaseBrowserClient.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: formState.name.trim() ? { name: formState.name.trim() } : undefined,
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
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Welcome</p>
          <h1 className="text-3xl font-semibold">Login or create an account</h1>
          <p className="text-sm text-base-content/70">
            Access Coach Pro with your Supabase credentials. You will be redirected after signing in.
          </p>
        </header>

        <div className="tabs tabs-boxed w-fit">
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

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <section className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                {mode === "signin" ? "Login" : "Create account"}
              </p>
              <h2 className="text-xl font-semibold">
                {mode === "signin" ? "Enter your credentials" : "Start your account"}
              </h2>
              <p className="text-sm text-base-content/70">
                Coach Pro uses Supabase authentication. Your session will be remembered across pages.
              </p>
            </header>

            <form className="space-y-3" onSubmit={handleSubmit}>
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

              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Working..." : mode === "signin" ? "Login" : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
