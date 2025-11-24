import type { Module } from "@/components/dashboard/types";

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

export function ModuleBadges({ module }: { module: Module }) {
  return (
    <div className="flex flex-wrap gap-1">
      <span className="badge badge-outline badge-xs capitalize">{module.category}</span>
      {module.subcategory && (
        <span className="badge badge-outline badge-xs">Underkategori: {module.subcategory}</span>
      )}
      {module.distanceMeters !== undefined && (
        <span className="badge badge-outline badge-xs">Distans: {module.distanceMeters} m</span>
      )}
      {formatDuration(module.durationMinutes, module.durationSeconds) && (
        <span className="badge badge-outline badge-xs">
          Tid: {formatDuration(module.durationMinutes, module.durationSeconds)}
        </span>
      )}
      {module.weightKg !== undefined && (
        <span className="badge badge-outline badge-xs">Vikt: {module.weightKg} kg</span>
      )}
    </div>
  );
}
