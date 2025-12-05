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
            <div className="dropdown dropdown-end">
              <button
                className="btn btn-sm btn-primary rounded-full"
                type="button"
                tabIndex={0}
                aria-label="Visa kontoinformation"
              >
                <i className="ri-account-circle-fill text-lg" aria-hidden="true" />
              </button>
              <div className="dropdown-content z-[1] mt-3 w-64 rounded-box border border-base-300 bg-base-100 p-4 shadow">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="font-semibold">
                    {profile?.name?.split(" ")[0] ?? user.email}
                    {profile?.name?.includes(" ") && (
                      <>
                        {" "}
                        {profile.name.split(" ").slice(1).join(" ")}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-base-content/70">{user.email}</div>
                  <div className="badge badge-outline w-fit">
                    {profile?.isCoach ? "Coach" : "Inte coach"}
                  </div>
                  <button
                    className="btn btn-sm btn-ghost justify-start"
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    Logga ut
                  </button>
                </div>
              </div>
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

