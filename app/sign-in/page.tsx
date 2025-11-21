"use client";

import { FormEvent, useState } from "react";

import { signUpUser } from "@/lib/supabase/auth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isCoach, setIsCoach] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const result = await signUpUser({
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
        isCoach,
      });

      const createdEmail = result.authUser?.email ?? email;
      const profileId = result.profile?.id;
      setMessage(
        profileId
          ? `Created account for ${createdEmail} with profile id ${profileId}.`
          : `Created account for ${createdEmail}.`,
      );
      setEmail("");
      setPassword("");
      setName("");
      setIsCoach(false);
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Supabase auth</p>
          <h1 className="text-3xl font-semibold">Create an account</h1>
          <p className="text-base text-base-content/70">
            Generate a Supabase auth user and a matching profile record in the <code>user</code> table.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <form className="card border border-base-300 bg-base-200 shadow-sm" onSubmit={handleSubmit}>
          <div className="card-body space-y-4">
            <label className="form-control">
              <span className="label-text">Email</span>
              <input
                type="email"
                className="input input-bordered"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="athlete@example.com"
              />
            </label>

            <label className="form-control">
              <span className="label-text">Password</span>
              <input
                type="password"
                className="input input-bordered"
                required
                value={password}
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="form-control">
              <span className="label-text">Full name (optional)</span>
              <input
                type="text"
                className="input input-bordered"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Skyler Athlete"
              />
            </label>

            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={isCoach}
                onChange={(event) => setIsCoach(event.target.checked)}
              />
              <span className="label-text">Register as coach</span>
            </label>

            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
