type ModuleBadgeData = {
  category: string;
  subcategory?: string;
  distance?: number;
  duration?: number;
  weight?: number;
};

const formatDuration = (duration?: number) =>
  duration !== undefined ? `${duration} min` : "";

type ModuleBadgesProps = {
  module: ModuleBadgeData;
  showPlaceholders?: boolean;
};

export function ModuleBadges({
  module,
  showPlaceholders = false,
}: ModuleBadgesProps) {
  const hasDistance = module.distance !== undefined;
  const hasWeight = module.weight !== undefined;
  const hasDuration = module.duration !== undefined;

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
