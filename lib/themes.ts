export const DEFAULT_THEME = "light" as const;

const EXTRA_THEMES = [
  "abyss",
  "acid",
  "aqua",
  "autumn",
  "bumblebee",
  "business",
  "caramellatte",
  "cmyk",
  "corporate",
  "cupcake",
  "cyberpunk",
  "dim",
  "dracula",
  "emerald",
  "fantasy",
  "forest",
  "garden",
  "halloween",
  "lemonade",
  "lofi",
  "luxury",
  "night",
  "nord",
  "pastel",
  "retro",
  "silk",
  "sunset",
  "synthwave",
  "valentine",
  "winter",
  "coffee",
  "black",
] as const;

export const SUPPORTED_THEMES = ["light", "dark", ...EXTRA_THEMES] as const;

export type ThemeName = (typeof SUPPORTED_THEMES)[number];

export const FEATURED_THEMES: { label: string; value: ThemeName }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export const ADDITIONAL_THEMES: ThemeName[] = [...EXTRA_THEMES].sort((a, b) => a.localeCompare(b));

export const isThemeName = (value: string): value is ThemeName =>
  (SUPPORTED_THEMES as readonly string[]).includes(value);

export const sanitizeTheme = (theme: string | undefined | null): ThemeName =>
  isThemeName(theme ?? "") ? theme : DEFAULT_THEME;
