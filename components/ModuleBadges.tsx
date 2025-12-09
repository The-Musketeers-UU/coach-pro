type ModuleBadgeData = {
  category: string;
  subcategory?: string;
  distance?: number | null;
  duration?: number | null;
  weight?: number | null;
};

const formatDuration = (duration?: number | null) =>
  duration !== undefined && duration !== null ? `${duration} min` : "";

type ModuleBadgesProps = {
  module: ModuleBadgeData;
  showPlaceholders?: boolean;
};

export function ModuleBadges({
  module,
  showPlaceholders = false,
}: ModuleBadgesProps) {
  const hasDistance = module.distance !== undefined && module.distance !== null;
  const hasWeight = module.weight !== undefined && module.weight !== null;
  const hasDuration = module.duration !== undefined && module.duration !== null;

  return (
    <div className="flex flex-wrap gap-1">
      <span className="badge badge-xs capitalize badge-accent">{module.category}</span>
      {(module.subcategory || showPlaceholders) && (
        <span className="badge badge-outline badge-xs capitalize badge-accent badge-soft">
          {module.subcategory || "-"}
        </span>
      )}
      {(hasDistance || showPlaceholders) && (
        <span className="badge badge-xs">
          Distans: {hasDistance ? module.distance : "-"} m
        </span>
      )}
      {(hasDuration || showPlaceholders) && (
        <span className="badge badge-xs">
          Tid: {formatDuration(module.duration) || "-"}
        </span>
      )}
      {(hasWeight || showPlaceholders) && (
        <span className="badge badge-xs">Vikt: {hasWeight ? module.weight : "-"} kg</span>
      )}
    </div>
  );
}
