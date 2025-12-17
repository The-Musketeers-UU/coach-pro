import { formatCentiseconds } from "@/lib/time";

type ModuleBadgeData = {
  category: string;
  subcategory?: string;
};

const formatDuration = (duration?: number | null) => formatCentiseconds(duration);

type ModuleBadgesProps = {
  module: ModuleBadgeData;
  showPlaceholders?: boolean;
};

export function ModuleBadges({
  module,
  showPlaceholders = false,
}: ModuleBadgesProps) {

  return (
    <div className="flex flex-wrap gap-1">
      <span className="badge badge-xs capitalize badge-accent">{module.category}</span>
      {(module.subcategory || showPlaceholders) && (
        <span className="badge badge-outline badge-xs capitalize badge-accent badge-soft">
          {module.subcategory || "-"}
        </span>
      )}
    </div>
  );
}
