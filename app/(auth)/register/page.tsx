"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function RegisterPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // här kan du senare lägga riktig registreringslogik
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Skapa konto</h1>

          <p className="text-sm text-center mb-4">
            Kom igång på ett par sekunder 🚀
          </p>

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
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Registrera dig som</span>
              </label>

              <div className="flex items-center gap-4">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    defaultChecked
                    value="coach"
                  />
                  <span className="label-text">Coach</span>
                </label>

                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    className="radio radio-primary"
                    value="aktiv"
                  />
                  <span className="label-text">Aktiv</span>
                </label>
              </div>
            </div>

            <div className="form-control mt-2 pt-4">
              <button type="submit" className="btn btn-primary w-full">
                Skapa konto
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
