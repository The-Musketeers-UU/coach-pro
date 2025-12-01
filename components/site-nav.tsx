"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme_toggle";
import { useAuth } from "@/components/auth-provider";

const coachLinks = [
  { href: "/schedule_builder", label: "Schemabyggare" },
  { href: "/dashboard", label: "Träningsöversikt" },
];

const athleteLinks = [{ href: "/athlete", label: "Mina scheman" }];

export function SiteNav() {
  const pathname = usePathname();
  const { user, signOut, isLoading, profile } = useAuth();
  const navLinks = profile?.isCoach ? coachLinks : athleteLinks;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-base-300 bg-base-200 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-primary pr-3">
            Coach Pro
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-sm ${
                  isActive ? "btn-primary" : "btn-ghost border-base-200"
                } rounded-full px-4`}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <div className="flex flex-wrap items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-sm">
              <div className="flex flex-col leading-tight">
                <span className="text-xs uppercase text-neutral">Inloggad</span>
                <span className="font-semibold">{user.email}</span>
              </div>
              <button className="btn btn-xs btn-ghost" onClick={handleSignOut} disabled={isLoading}>
                Logga ut
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`btn btn-sm ${
                pathname.startsWith("/login") ? "btn-primary" : "btn-ghost border-base-200"
              } rounded-full px-4`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

