"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();          // ⛔ stoppa vanlig form-submit
    // här kan du senare lägga riktig auth-logik
    router.push("/dashboard");       // ✅ klientnavigering
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-center">Logga in</h1>

          <p className="text-sm text-center mb-4">Välkommen tillbaka 👋</p>

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

            <div className="form-control mt-2 pt-4">
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Logga in
              </button>
            </div>
          </form>

          <p className="text-center text-sm mt-4">
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
