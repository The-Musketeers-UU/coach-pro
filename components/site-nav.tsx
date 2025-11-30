"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme_toggle";
import {ProfileBox} from './ProfileBox'

const viewOptions = [
  { href: "/athlete", label: "Athlete view" },
  { href: "/", label: "Coach view" },
];

const coachLinks = [
  { href: "/", label: "Program Builder" },
  { href: "/dashboard", label: "Training Dashboard" },
];

const athleteLinks = [{ href: "/athlete", label: "My Schedules" }];


export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activeView = viewOptions.find((view) => pathname.startsWith(view.href)) ?? viewOptions[1];
  const navLinks = activeView.href === "/athlete" ? athleteLinks : coachLinks;

  return (
    <header className="border-b border-base-300 bg-base-200 z-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight text-primary">
            Coach Pro
          </Link>
          <ThemeToggle />
          <div className="dropdown dropdown-end">
                        <ProfileBox></ProfileBox>

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
        </nav>
      </div>
    </header>
  );
}

