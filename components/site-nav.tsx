"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme_toggle";
import { useAuth } from "@/components/auth-provider";
import { getPendingTrainingGroupInvites } from "@/lib/supabase/training-modules";

const statsLink = { href: "/stats", label: "Statistik" };
const trainingGroupsLink = { href: "/training-groups", label: "Träningsgrupper" };

const coachLinks = [
  { href: "/schedule_builder", label: "Schemabyggare" },
  { href: "/dashboard", label: "Träningsöversikt" },
  trainingGroupsLink,
  statsLink,
];

const athleteLinks = [
  { href: "/athlete", label: "Mina scheman" },
  trainingGroupsLink,
  statsLink,
];

export function SiteNav() {
  const pathname = usePathname();
  const { user, signOut, isLoading, profile } = useAuth();
  const fallbackRole: "coach" | "athlete" = useMemo(() => {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/schedule_builder")) {
      return "coach";
    }
    return "athlete";
  }, [pathname]);
  const [storedRole, setStoredRole] = useState<"coach" | "athlete">(fallbackRole);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasPendingInvites, setHasPendingInvites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.sessionStorage.getItem("navRole");
    if (saved === "coach" || saved === "athlete") {
      setStoredRole(saved);
    } else {
      window.sessionStorage.setItem("navRole", fallbackRole);
      setStoredRole(fallbackRole);
    }
  }, [fallbackRole]);

  const resolvedRole = useMemo(() => {
    if (typeof profile?.isCoach === "boolean") {
      return profile.isCoach ? "coach" : "athlete";
    }

    if (typeof user?.user_metadata?.isCoach === "boolean") {
      return user.user_metadata.isCoach ? "coach" : "athlete";
    }

    return storedRole;
  }, [profile?.isCoach, storedRole, user?.user_metadata?.isCoach]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("navRole", resolvedRole);
    }
  }, [resolvedRole]);

  const isCoach = resolvedRole === "coach";
  const navLinks = isCoach ? coachLinks : athleteLinks;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsDropdownOpen(false);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!user?.id) {
      setHasPendingInvites(false);
      return;
    }

    let isActive = true;

    const loadPendingInvites = async () => {
      try {
        const invites = await getPendingTrainingGroupInvites(user.id);
        if (isActive) {
          setHasPendingInvites(invites.length > 0);
        }
      } catch (error) {
        if (isActive) {
          setHasPendingInvites(false);
        }
      }
    };

    void loadPendingInvites();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const handleInviteUpdate = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const count = Number(event.detail);
      setHasPendingInvites(Number.isFinite(count) && count > 0);
    };

    window.addEventListener("training-group-invites-updated", handleInviteUpdate);
    return () => {
      window.removeEventListener("training-group-invites-updated", handleInviteUpdate);
    };
  }, []);

  const showAuthenticatedShell = Boolean(user) || isLoading || isSigningOut;

  return (
    <header className="border-b border-base-300 bg-base-200 z-40 sticky top-0">
      <div className="mx-auto flex max-w-7xl py-4 flex-row justify-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            aria-label="Coach Pro"
            className="hidden text-2xl font-semibold tracking-tight text-primary pr-3 sm:inline-flex cursor-default"
          >
            Coach Pro
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-3">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === link.href : pathname.startsWith(link.href);
            const showInviteStatus =
              link.href === trainingGroupsLink.href && hasPendingInvites;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`btn btn-sm ${
                  isActive ? "btn-primary" : "btn-ghost border-base-200"
                } ${showInviteStatus ? "relative" : ""} rounded-full px-4`}
              >
                {link.label}
                {showInviteStatus && (
                  <div
                    aria-label="info"
                    className="status status-info absolute -right-0.5 -top-0.5"
                  ></div>
                )}
              </Link>
            );
          })}

          {showAuthenticatedShell ? (
            <div
              className={`dropdown dropdown-end ${isDropdownOpen ? "dropdown-open" : ""}`}
              ref={dropdownRef}
            >
              <button
                className="btn btn-sm btn-primary btn-circle"
                type="button"
                tabIndex={0}
                aria-label="Visa kontoinformation"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(true)}
                disabled={!user}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM6.02332 15.4163C7.49083 17.6069 9.69511 19 12.1597 19C14.6243 19 16.8286 17.6069 18.2961 15.4163C16.6885 13.9172 14.5312 13 12.1597 13C9.78821 13 7.63095 13.9172 6.02332 15.4163ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" />
                </svg>
              </button>
              <div className="dropdown-content z-[1] mt-3 w-64 rounded-box border border-base-300 bg-base-100 p-4 shadow">
                <div className="flex flex-col gap-2 text-sm" onClick={(event) => event.stopPropagation()}>
                  <div className="font-semibold">
                    {profile?.name?.split(" ")[0] ?? user?.email ?? "Profil"}
                    {profile?.name?.includes(" ") && (
                      <>
                        {" "}
                        {profile.name.split(" ").slice(1).join(" ")}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-base-content/70">{user?.email ?? "Laddar..."}</div>
                  <div className="text-xs">Kontotyp: {isCoach ? "Coach" : "Atlet"}</div>
                  <div>
                    <div className="divider my-1" />
                    <Link
                      href="/settings"
                      className="btn btn-sm btn-ghost w-full justify-start gap-2 py-0 sm:py-2"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M2 11.9998C2 11.1353 2.1097 10.2964 2.31595 9.49631C3.40622 9.55283 4.48848 9.01015 5.0718 7.99982C5.65467 6.99025 5.58406 5.78271 4.99121 4.86701C6.18354 3.69529 7.66832 2.82022 9.32603 2.36133C9.8222 3.33385 10.8333 3.99982 12 3.99982C13.1667 3.99982 14.1778 3.33385 14.674 2.36133C16.3317 2.82022 17.8165 3.69529 19.0088 4.86701C18.4159 5.78271 18.3453 6.99025 18.9282 7.99982C19.5115 9.01015 20.5938 9.55283 21.6841 9.49631C21.8903 10.2964 22 11.1353 22 11.9998C22 12.8643 21.8903 13.7032 21.6841 14.5033C20.5938 14.4468 19.5115 14.9895 18.9282 15.9998C18.3453 17.0094 18.4159 18.2169 19.0088 19.1326C17.8165 20.3043 16.3317 21.1794 14.674 21.6383C14.1778 20.6658 13.1667 19.9998 12 19.9998C10.8333 19.9998 9.8222 20.6658 9.32603 21.6383C7.66832 21.1794 6.18354 20.3043 4.99121 19.1326C5.58406 18.2169 5.65467 17.0094 5.0718 15.9998C4.48848 14.9895 3.40622 14.4468 2.31595 14.5033C2.1097 13.7032 2 12.8643 2 11.9998ZM6.80385 14.9998C7.43395 16.0912 7.61458 17.3459 7.36818 18.5236C7.77597 18.8138 8.21005 19.0652 8.66489 19.2741C9.56176 18.4712 10.7392 17.9998 12 17.9998C13.2608 17.9998 14.4382 18.4712 15.3351 19.2741C15.7899 19.0652 16.224 18.8138 16.6318 18.5236C16.3854 17.3459 16.566 16.0912 17.1962 14.9998C17.8262 13.9085 18.8225 13.1248 19.9655 12.7493C19.9884 12.5015 20 12.2516 20 11.9998C20 11.7481 19.9884 11.4981 19.9655 11.2504C18.8225 10.8749 17.8262 10.0912 17.1962 8.99982C16.566 7.90845 16.3854 6.65378 16.6318 5.47605C16.224 5.18588 15.7899 4.93447 15.3351 4.72552C14.4382 5.52844 13.2608 5.99982 12 5.99982C10.7392 5.99982 9.56176 5.52844 8.66489 4.72552C8.21005 4.93447 7.77597 5.18588 7.36818 5.47605C7.61458 6.65378 7.43395 7.90845 6.80385 8.99982C6.17376 10.0912 5.17754 10.8749 4.03451 11.2504C4.01157 11.4981 4 11.7481 4 11.9998C4 12.2516 4.01157 12.5015 4.03451 12.7493C5.17754 13.1248 6.17376 13.9085 6.80385 14.9998ZM12 14.9998C10.3431 14.9998 9 13.6567 9 11.9998C9 10.343 10.3431 8.99982 12 8.99982C13.6569 8.99982 15 10.343 15 11.9998C15 13.6567 13.6569 14.9998 12 14.9998ZM12 12.9998C12.5523 12.9998 13 12.5521 13 11.9998C13 11.4475 12.5523 10.9998 12 10.9998C11.4477 10.9998 11 11.4475 11 11.9998C11 12.5521 11.4477 12.9998 12 12.9998Z"></path>
                      </svg>
                      Inställningar
                    </Link>
                    <div className="flex items-center justify-between text-xs">
                      <ThemeToggle compact />
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-ghost justify-start gap-2 py-0 sm:py-2"
                    onClick={handleSignOut}
                    disabled={isLoading || !user}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M5 22C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V6H18V4H6V20H18V18H20V21C20 21.5523 19.5523 22 19 22H5ZM18 16V13H11V11H18V8L23 12L18 16Z" />
                    </svg>
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
