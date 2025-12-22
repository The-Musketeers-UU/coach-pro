export const DEFAULT_THEME = "light" as const;

export const SUPPORTED_THEMES = [
  "light",
  "dim",
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
  { label: "Light", value: "light" },
  { label: "Dim", value: "dim" },
];

export const ADDITIONAL_THEMES: ThemeName[] = [
  "dracula",
  "nord",
  "valentine",
  "synthwave",
  "retro",
  "cupcake",
  "caramellatte",
  "aqua",
];

export const isThemeName = (value: string): value is ThemeName =>
  (SUPPORTED_THEMES as readonly string[]).includes(value);

export const sanitizeTheme = (theme: string | undefined | null): ThemeName =>
  isThemeName(theme ?? "") ? theme : DEFAULT_THEME;
