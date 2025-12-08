"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleBadges } from "@/components/ModuleBadges";

export type ProgramModule = {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  distanceMeters?: number;
  weightKg?: number;
  durationMinutes?: number;
  durationSeconds?: number;
};

export type ProgramDay = {
  id: string;
  label: string;
  modules: ProgramModule[];
};

export type ProgramWeek = {
  id: string;
  label: string;
  focus?: string;
  days: ProgramDay[];
};

type WeekScheduleViewProps = {
  week?: ProgramWeek;
  weekNumber: number;
  title?: string;
  emptyWeekTitle?: string;
  emptyWeekDescription?: string;
};

const formatDuration = (minutes?: number, seconds?: number) => {
  if (minutes === undefined && seconds === undefined) {
    return "";
  }

  const minValue = minutes ?? 0;
  const secValue = seconds ?? 0;

  return `${minValue} min ${secValue} sek`;
};

const formatDistance = (distanceMeters?: number) =>
  distanceMeters !== undefined ? `${distanceMeters} m` : "-";

const formatWeight = (weightKg?: number) =>
  weightKg !== undefined ? `${weightKg} kg` : "-";

export function WeekScheduleView({
  week,
  weekNumber,
  title,
  emptyWeekTitle = "Inget program",
  emptyWeekDescription = "Ingen data för veckan.",
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] = useState<ProgramModule | null>(
    null
  );
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    week?.days[0]?.id ?? null
  );
  const heading =
    title ??
    (week
      ? week.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  useEffect(() => {
    setSelectedDayId(week?.days[0]?.id ?? null);
  }, [week?.id, week?.days]);

  const selectedDay = useMemo(
    () => week?.days.find((day) => day.id === selectedDayId),
    [selectedDayId, week?.days]
  );

  const renderDayContent = (day: ProgramDay) => (
    <article
      key={day.id}
      className="flex min-h-[600px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-2"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral hidden sm:block">
            {day.label}
          </p>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1">
        {day.modules.map((module, index) => (
          <button
            key={`${day.id}-${index}-${module.title}`}
            type="button"
            onClick={() => setSelectedModule(module)}
            className="group w-full text-left"
          >
            <div className="space-y-2 rounded-xl border border-base-200 bg-base-100 p-3 transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-base-content">
                  {module.title}
                </p>
              </div>
              <p className="text-xs text-base-content/70">{module.description}</p>
              <ModuleBadges module={module} />
            </div>
          </button>
        ))}

        {day.modules.length === 0 && (
          <p className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
            Inga pass schemalagda.
          </p>
        )}
      </div>
    </article>
  );

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="grid grid-cols-3 items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">{heading}</h2>
            {week?.focus && (
              <p className="text-sm text-base-content/70">{week.focus}</p>
            )}
          </div>
        </div>

        {week ? (
          <div className="space-y-4">
            {week.days.length > 0 && (
              <div className="md:hidden -mx-4 sm:-mx-6">
                <div className="flex w-full items-center overflow-x-auto border border-base-300 bg-base-100">
                  {week.days.map((day) => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setSelectedDayId(day.id)}
                      className={`btn btn-sm w-full flex-1 whitespace-nowrap ${
                        selectedDay?.id === day.id
                          ? "btn-primary"
                          : "btn-ghost"
                      }`}
                    >
                      <span aria-hidden>{day.label.slice(0, 1)}</span>
                      <span className="sr-only">{day.label}</span>
                    </button>
                  ))}
                </div>

                {selectedDay && (
                  <div className="mt-2 w-full sm:px-6">
                    {renderDayContent(selectedDay)}
                  </div>
                )}
              </div>
            )}

            <div className="hidden grid-cols-1 gap-1 md:grid md:grid-cols-2 xl:grid-cols-7">
              {week.days.map((day) => renderDayContent(day))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-6 text-center text-sm text-base-content/70">
            Tom vecka.
          </div>
        )}
      </div>

      {selectedModule && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedModule.title}
                </h3>
              </div>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setSelectedModule(null)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral">
                  Titel
                </p>
                <p className="text-base font-semibold text-base-content">
                  {selectedModule.title}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral">
                  Beskrivning
                </p>
                <p className="text-sm leading-relaxed text-base-content/80">
                  {selectedModule.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Kategori
                  </p>
                  <p className="badge badge-outline capitalize">
                    {selectedModule.category || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Underkategori
                  </p>
                  <p className="text-sm text-base-content/80">
                    {selectedModule.subcategory || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Distans
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatDistance(selectedModule.distanceMeters)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Vikt
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatWeight(selectedModule.weightKg)}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Tid
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatDuration(
                      selectedModule.durationMinutes,
                      selectedModule.durationSeconds
                    ) || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedModule(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
