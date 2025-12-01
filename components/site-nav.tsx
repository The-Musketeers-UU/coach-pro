"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme_toggle";
import { useAuth } from "@/components/auth-provider";

const viewOptions = [
  { href: "/athlete", label: "Athlete view" },
  { href: "/dashboard", label: "Coach view" },
];

const coachLinks = [
  { href: "/schedule_builder", label: "Schemabyggare" },
  { href: "/dashboard", label: "Träningsöversikt" },
];

const athleteLinks = [{ href: "/athlete", label: "Mina scheman" }];

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const activeView = viewOptions.find((view) => pathname.startsWith(view.href)) ?? viewOptions[1];
  const navLinks =
    activeView.href === "/athlete"
      ? athleteLinks
      : coachLinks.filter((link) => (user ? link.href !== "/login" : true));

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
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-sm btn-ghost rounded-full border-base-200 px-4">
              {activeView.label}
              <span className="ml-1">▾</span>
            </label>
            <ul tabIndex={0} className="menu dropdown-content z-1 mt-2 w-48 rounded-box border border-base-300 bg-base-200 p-2 shadow">
              {viewOptions.map((view) => (
                <li key={view.href}>
                  <button
                    className={pathname.startsWith(view.href) ? "active" : ""}
                    onClick={() => router.push(view.href)}
                  >
                    {view.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
                <span className="text-xs uppercase text-neutral">Signed in</span>
                <span className="font-semibold">{user.email}</span>
              </div>
              <button className="btn btn-xs btn-ghost" onClick={handleSignOut} disabled={isLoading}>
                Sign out
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

