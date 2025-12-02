import type { CSSProperties } from "react";

type ModuleBadgeData = {
  category: string;
  subcategory?: string;
  distanceMeters?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  weightKg?: number;
};

type BadgeSize = "xs" | "sm" | "md" | "lg";

type BadgeColors = {
  background: string;
  border: string;
  text: string;
};

const categoryPalette: BadgeColors[] = [
  { background: "#2563eb", border: "#1d4ed8", text: "#e0f2fe" }, // blue
  { background: "#db2777", border: "#be185d", text: "#fdf2f8" }, // pink
  { background: "#16a34a", border: "#15803d", text: "#ecfdf3" }, // green
  { background: "#f97316", border: "#ea580c", text: "#fff7ed" }, // orange
  { background: "#0ea5e9", border: "#0284c7", text: "#f0f9ff" }, // sky
  { background: "#a855f7", border: "#9333ea", text: "#f5f3ff" }, // purple
  { background: "#eab308", border: "#ca8a04", text: "#422006" }, // amber
];

const neutralBadge: BadgeColors = {
  background: "#e5e7eb",
  border: "#d1d5db",
  text: "#111827",
};

const getCategoryColor = (category?: string): BadgeColors => {
  if (!category) return neutralBadge;

  const normalized = category.trim().toLowerCase();
  if (!normalized) return neutralBadge;

  const hash = normalized
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return categoryPalette[hash % categoryPalette.length] ?? neutralBadge;
};

type BadgeAppearance = {
  className: string;
  style: CSSProperties;
};

type BadgeOptions = { outline?: boolean; soft?: boolean; size?: BadgeSize };

export const getCategoryBadgeClassName = (
  category?: string,
  { outline = false, soft = false, size = "xs" }: BadgeOptions = {},
): BadgeAppearance => {
  const color = getCategoryColor(category);

  const className = [
    "badge",
    size && `badge-${size}`,
    "capitalize",
    outline && "badge-outline",
  ]
    .filter(Boolean)
    .join(" ");

  const baseStyle: CSSProperties = {
    backgroundColor: color.background,
    borderColor: color.border,
    color: color.text,
  };

  if (outline) {
    baseStyle.backgroundColor = soft ? `${color.background}1a` : "transparent";
    baseStyle.color = color.border;
  } else if (soft) {
    baseStyle.backgroundColor = `${color.background}26`;
    baseStyle.color = color.border;
    baseStyle.borderColor = `${color.border}80`;
  }

  return {
    className,
    style: baseStyle,
  };
};

const formatDuration = (minutes?: number, seconds?: number) => {
  const parts: string[] = [];

  if (minutes !== undefined) {
    parts.push(`${minutes} min`);
  }

  if (seconds !== undefined) {
    parts.push(`${seconds} sec`);
  }

  return parts.join(" ");
};

type ModuleBadgesProps = {
  module: ModuleBadgeData;
  showPlaceholders?: boolean;
};

export function ModuleBadges({
  module,
  showPlaceholders = false,
}: ModuleBadgesProps) {
  const hasDistance = module.distanceMeters !== undefined;
  const hasWeight = module.weightKg !== undefined;
  const hasDuration =
    module.durationMinutes !== undefined || module.durationSeconds !== undefined;

  const categoryBadge = getCategoryBadgeClassName(module.category);
  const subcategoryBadge = getCategoryBadgeClassName(module.category, {
    outline: true,
    soft: true,
  });

  return (
    <div className="flex flex-wrap gap-1">
      <span className={categoryBadge.className} style={categoryBadge.style}>
        {module.category}
      </span>
      {(module.subcategory || showPlaceholders) && (
        <span className={subcategoryBadge.className} style={subcategoryBadge.style}>
          {module.subcategory || "-"}
        </span>
      )}
      {(hasDistance || showPlaceholders) && (
        <span className="badge badge-xs">
          Distans: {hasDistance ? module.distanceMeters : "-"} m
        </span>
      )}
      {(hasDuration || showPlaceholders) && (
        <span className="badge badge-xs">
          Tid: {formatDuration(module.durationMinutes, module.durationSeconds) || "-"}
        </span>
      )}
      {(hasWeight || showPlaceholders) && (
        <span className="badge badge-xs">Vikt: {hasWeight ? module.weightKg : "-"} kg</span>
      )}
    </div>
  );
}
