"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  createUser,
  getAthletes,
  getCoaches,
  type AthleteRow,
} from "@/lib/supabase/training-modules";

const defaultUserForm = () => ({
  name: "",
  email: "",
  isCoach: false,
});

export default function LoginPage() {
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [coaches, setCoaches] = useState<AthleteRow[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshRoster = async () => {
    setIsLoadingRoster(true);
    setError(null);
    try {
      const [coachRows, athleteRows] = await Promise.all([getCoaches(), getAthletes()]);
      setCoaches(coachRows);
      setAthletes(athleteRows);
    } catch (supabaseError) {
      setError(
        supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
      );
    } finally {
      setIsLoadingRoster(false);
    }
  };

  useEffect(() => {
    void refreshRoster();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const createdUser = await createUser({
        ...userForm,
        name: userForm.name.trim(),
        email: userForm.email.trim(),
      });

      setMessage(
        `${createdUser.name} (${createdUser.email}) created as ${createdUser.isCoach ? "coach" : "athlete"}.`,
      );
      setUserForm(defaultUserForm());
      void refreshRoster();
    } catch (supabaseError) {
      setError(
        supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Access</p>
          <h1 className="text-3xl font-semibold">Create coaches & athletes</h1>
          <p className="text-sm text-base-content/70">
            Seed Supabase with new users so you can assign modules and schedule weeks to real IDs.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <section className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">New user</p>
              <h2 className="text-xl font-semibold">Quick create</h2>
            </header>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="form-control">
                <span className="label-text">Name</span>
                <input
                  type="text"
                  className="input input-bordered"
                  required
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Alex Coachman"
                />
              </label>

              <label className="form-control">
                <span className="label-text">Email</span>
                <input
                  type="email"
                  className="input input-bordered"
                  required
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="alex@example.com"
                />
              </label>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    checked={!userForm.isCoach}
                    onChange={() => setUserForm((prev) => ({ ...prev, isCoach: false }))}
                  />
                  Athlete
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    checked={userForm.isCoach}
                    onChange={() => setUserForm((prev) => ({ ...prev, isCoach: true }))}
                  />
                  Coach
                </label>
              </div>

              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving user..." : "Create in Supabase"}
              </button>
            </form>
          </div>
        </section>

        <section className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-3">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Roster</p>
                <h2 className="text-lg font-semibold">Existing users</h2>
              </div>
              {isLoadingRoster && (
                <span className="loading loading-spinner" aria-label="Loading roster" />
              )}
            </header>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Coaches</p>
                <div className="flex flex-wrap gap-2">
                  {coaches.length ? (
                    coaches.map((coach) => (
                      <span key={coach.id} className="badge badge-outline" title={coach.email}>
                        {coach.name} · {coach.id}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-base-content/70">No coaches yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Athletes</p>
                <div className="flex flex-wrap gap-2">
                  {athletes.length ? (
                    athletes.map((athlete) => (
                      <span key={athlete.id} className="badge badge-outline" title={athlete.email}>
                        {athlete.name} · {athlete.id}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-base-content/70">No athletes yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
