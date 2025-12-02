type ModuleBadgeData = {
  category: string;
  subcategory?: string;
  distanceMeters?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  weightKg?: number;
};

type BadgeSize = "xs" | "sm" | "md" | "lg";

const categoryColors = [
  "primary",
  "secondary",
  "accent",
  "info",
  "success",
  "warning",
  "error",
];

const getCategoryColor = (category?: string) => {
  if (!category) return "neutral";

  const normalized = category.trim().toLowerCase();
  if (!normalized) return "neutral";

  const hash = normalized
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return categoryColors[hash % categoryColors.length] ?? "neutral";
};

export const getCategoryBadgeClassName = (
  category?: string,
  {
    outline = false,
    soft = false,
    size = "xs",
  }: { outline?: boolean; soft?: boolean; size?: BadgeSize } = {}
) => {
  const color = getCategoryColor(category);

  return [
    "badge",
    size && `badge-${size}`,
    "capitalize",
    `badge-${color}`,
    outline && "badge-outline",
    soft && "badge-soft",
  ]
    .filter(Boolean)
    .join(" ");
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

  const categoryBadgeClassName = getCategoryBadgeClassName(module.category);
  const subcategoryBadgeClassName = getCategoryBadgeClassName(module.category, {
    outline: true,
    soft: true,
  });

  return (
    <div className="flex flex-wrap gap-1">
      <span className={categoryBadgeClassName}>{module.category}</span>
      {(module.subcategory || showPlaceholders) && (
        <span className={subcategoryBadgeClassName}>
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
