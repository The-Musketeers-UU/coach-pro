"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Program Builder" },
  { href: "/dashboard", label: "Training Dashboard" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-base-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight text-primary">
            Coach Pro
          </Link>
          <p className="text-sm text-base-content/70">High-performance coaching OS</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
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

