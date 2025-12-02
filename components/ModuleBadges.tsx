type ModuleBadgeData = {
  category: string;
  subcategory?: string[];
  distanceMeters?: number[];
  duration?: { minutes?: number; seconds?: number }[];
  weightKg?: number[];
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
  const hasDistance = module.distanceMeters && module.distanceMeters.length > 0;
  const hasWeight = module.weightKg && module.weightKg.length > 0;
  const hasDuration = module.duration && module.duration.length > 0;

  return (
    <div className="flex flex-wrap gap-1">
      <span className="badge badge-xs capitalize badge-accent">{module.category}</span>
      {(module.subcategory?.length || showPlaceholders) && (
        <span className="badge badge-outline badge-xs capitalize badge-accent badge-soft">
          {module.subcategory?.join(", ") || "-"}
        </span>
      )}
      {(hasDistance || showPlaceholders) && (
        <span className="badge badge-xs">
          Distans: {hasDistance ? module.distanceMeters?.join(", ") : "-"} m
        </span>
      )}
      {(hasDuration || showPlaceholders) && (
        <span className="badge badge-xs">
          Tid:
          {hasDuration
            ? module.duration
                ?.map((entry) => formatDuration(entry.minutes, entry.seconds))
                .join(", ")
            : "-"}
        </span>
      )}
      {(hasWeight || showPlaceholders) && (
        <span className="badge badge-xs">
          Vikt: {hasWeight ? module.weightKg?.join(", ") : "-"} kg
        </span>
      )}
    </div>
  );
}
