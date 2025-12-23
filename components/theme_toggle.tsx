"use client";

import { useEffect, useState } from "react";
import {
  ADDITIONAL_THEMES,
  DEFAULT_THEME,
  FEATURED_THEMES,
  ThemeName,
  sanitizeTheme,
} from "@/lib/themes";

type ThemeToggleProps = {
  compact?: boolean;
  groupName?: string;
};

const THEME_COOKIE_NAME = "theme";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const readThemeCookie = (): string | undefined => {
  if (typeof document === "undefined") return undefined;

  const rawCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${THEME_COOKIE_NAME}=`));

  if (!rawCookie) return undefined;

  const [, value] = rawCookie.split(`${THEME_COOKIE_NAME}=`);
  return value ? decodeURIComponent(value) : undefined;
};

const applyTheme = (theme: ThemeName) => {
  if (typeof document === "undefined") return;

  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(
    theme,
  )}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;
};

export function ThemeToggle({ compact = false, groupName = "theme-dropdown" }: ThemeToggleProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(() => {
    const storedTheme = readThemeCookie();
    const htmlTheme = typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : undefined;

    return sanitizeTheme(storedTheme ?? htmlTheme ?? DEFAULT_THEME);
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const target = document.documentElement;

    const syncFromDom = () => {
      const current = sanitizeTheme(target.getAttribute("data-theme"));
      setSelectedTheme((previous) => (previous === current ? previous : current));
    };

    const observer = new MutationObserver(syncFromDom);
    observer.observe(target, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  const handleThemeChange = (theme: ThemeName) => {
    setSelectedTheme(theme);
  };

  return (
    <div className="dropdown">
      <div
        tabIndex={0}
        role="button"
        className={`btn btn-ghost btn-sm rounded-full px-4 ${
          compact ? "py-0 sm:py-2 min-h-0 h-auto" : ""
        }`}
      >
        Färgtema
        <svg
          width="12px"
          height="12px"
          className="inline-block h-2 w-2 fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </div>

      <ul
        tabIndex={-1}
        className="dropdown-content bg-base-300 rounded-box z-50 w-56 p-2 shadow-2xl max-h-[50vh] overflow-y-auto left-0 right-auto"
      >
        {/* --- Utvalda teman --- */}
        {FEATURED_THEMES.map((theme) => (
          <li key={theme.value}>
            <input
              type="radio"
              name={groupName}
              className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
              aria-label={theme.label}
              value={theme.value}
              checked={selectedTheme === theme.value}
              onChange={() => handleThemeChange(theme.value)}
            />
          </li>
        ))}

        <div className="divider my-1"></div>

        {/* --- Övriga teman --- */}
        {ADDITIONAL_THEMES.map((theme) => (
          <li key={theme}>
            <input
              type="radio"
              name={groupName}
              className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start capitalize"
              aria-label={theme}
              value={theme}
              checked={selectedTheme === theme}
              onChange={() => handleThemeChange(theme)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
