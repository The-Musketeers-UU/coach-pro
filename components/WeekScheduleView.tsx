"use client";

import { useMemo, useState } from "react";

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
  days: ProgramDay[];
};

type ModuleFeedback = {
  sleepRating?: string;
  dayRating?: string;
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
  const [selectedModule, setSelectedModule] = useState<
    { module: ProgramModule; feedbackKey: string } | null
  >(null);
  const [feedbackByModule, setFeedbackByModule] = useState<
    Record<string, ModuleFeedback>
  >({});
  const heading =
    title ??
    (week
      ? week.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  const feedbackOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => {
        const value = String(index + 1);
        return (
          <option key={value} value={value}>
            {value}
          </option>
        );
      }),
    []
  );

  const handleFeedbackChange = (
    feedbackKey: string,
    field: keyof ModuleFeedback,
    value: string
  ) => {
    setFeedbackByModule((previous) => ({
      ...previous,
      [feedbackKey]: {
        ...previous[feedbackKey],
        [field]: value,
      },
    }));
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="grid grid-cols-3 items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">{heading}</h2>
          </div>
        </div>

        {week ? (
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-7">
            {week.days.map((day) => (
              <article
                key={day.id}
                className="flex min-h-[600px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                      {day.label}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex-1 space-y-1">
                  {day.modules.map((module, index) => {
                    const feedbackKey = `${week?.id ?? weekNumber}-${day.id}-${index}`;

                    return (
                      <div key={`${day.id}-${index}-${module.title}`} className="space-y-2 rounded-xl border border-base-200 bg-base-100 p-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedModule({
                              module,
                              feedbackKey,
                            })
                          }
                          className="group w-full text-left"
                        >
                          <div className="space-y-2 transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-base-content">
                                {module.title}
                              </p>
                            </div>
                            <p className="text-xs text-base-content/70">
                              {module.description}
                            </p>
                            <ModuleBadges module={module} />
                          </div>
                        </button>

                        <div className="space-y-2 rounded-xl border border-dashed border-base-200 bg-base-50 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral">Feedback (sparas inte)</p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <label className="form-control gap-1">
                              <span className="text-xs font-medium text-base-content/80">
                                Sömnskattning
                              </span>
                              <select
                                className="select select-sm select-bordered"
                                value={feedbackByModule[feedbackKey]?.sleepRating ?? ""}
                                onChange={(event) =>
                                  handleFeedbackChange(feedbackKey, "sleepRating", event.target.value)
                                }
                              >
                                <option value="" disabled>
                                  Välj mellan 1-10
                                </option>
                                {feedbackOptions}
                              </select>
                            </label>

                            <label className="form-control gap-1">
                              <span className="text-xs font-medium text-base-content/80">
                                Skattning av dagen
                              </span>
                              <select
                                className="select select-sm select-bordered"
                                value={feedbackByModule[feedbackKey]?.dayRating ?? ""}
                                onChange={(event) =>
                                  handleFeedbackChange(feedbackKey, "dayRating", event.target.value)
                                }
                              >
                                <option value="" disabled>
                                  Välj mellan 1-10
                                </option>
                                {feedbackOptions}
                              </select>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {day.modules.length === 0 && (
                    <p className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                      Inga pass schemalagda.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-6 text-center text-sm text-base-content/70">
            {emptyWeekDescription}
          </div>
        )}
      </div>

      {selectedModule && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedModule.module.title}
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
                  {selectedModule.module.title}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-neutral">
                  Beskrivning
                </p>
                <p className="text-sm leading-relaxed text-base-content/80">
                  {selectedModule.module.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Kategori
                  </p>
                  <p className="badge badge-outline capitalize">
                    {selectedModule.module.category || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Underkategori
                  </p>
                  <p className="text-sm text-base-content/80">
                    {selectedModule.module.subcategory || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Distans
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatDistance(selectedModule.module.distanceMeters)}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Vikt
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatWeight(selectedModule.module.weightKg)}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Tid
                  </p>
                  <p className="text-sm text-base-content/80">
                    {formatDuration(
                      selectedModule.module.durationMinutes,
                      selectedModule.module.durationSeconds
                    ) || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-base-200 bg-base-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                  Feedback (sparas inte)
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="form-control gap-1">
                    <span className="text-xs font-medium text-base-content/80">
                      Sömnskattning
                    </span>
                    <select
                      className="select select-sm select-bordered"
                      value={
                        feedbackByModule[selectedModule.feedbackKey]?.sleepRating ??
                        ""
                      }
                      onChange={(event) =>
                        handleFeedbackChange(
                          selectedModule.feedbackKey,
                          "sleepRating",
                          event.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Välj mellan 1-10
                      </option>
                      {feedbackOptions}
                    </select>
                  </label>

                  <label className="form-control gap-1">
                    <span className="text-xs font-medium text-base-content/80">
                      Skattning av dagen
                    </span>
                    <select
                      className="select select-sm select-bordered"
                      value={
                        feedbackByModule[selectedModule.feedbackKey]?.dayRating ??
                        ""
                      }
                      onChange={(event) =>
                        handleFeedbackChange(
                          selectedModule.feedbackKey,
                          "dayRating",
                          event.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Välj mellan 1-10
                      </option>
                      {feedbackOptions}
                    </select>
                  </label>
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
