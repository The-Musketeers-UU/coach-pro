export const DEFAULT_THEME = "light" as const;

export const SUPPORTED_THEMES = [
  "light",
  "dracula",
  "nord",
  "valentine",
  "synthwave",
  "retro",
  "cupcake",
  "caramellatte",
  "aqua",
] as const;

export type ThemeName = (typeof SUPPORTED_THEMES)[number];

export const FEATURED_THEMES: { label: string; value: ThemeName }[] = [
  { label: "Ljus", value: "light" },
  { label: "Mörk", value: "dracula" },
];

export const ADDITIONAL_THEMES: ThemeName[] = [
  "nord",
  "valentine",
  "retro",
  "caramellatte",
  "aqua",
];

export const isThemeName = (value: string): value is ThemeName =>
  (SUPPORTED_THEMES as readonly string[]).includes(value);

export const sanitizeTheme = (theme: string | undefined | null): ThemeName => {
  const candidate = theme ?? "";

  return isThemeName(candidate) ? candidate : DEFAULT_THEME;
};
