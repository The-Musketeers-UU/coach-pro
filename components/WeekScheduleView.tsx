"use client";

import { useState } from "react";

import { ModuleBadges } from "@/components/ModuleBadges";

export type ProgramModule = {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string[];
  distanceMeters?: number[];
  weightKg?: number[];
  duration?: { minutes?: number; seconds?: number }[];
  feedbackDescription?: string[];
  feedbackNumericValue?: (number | null)[];
  feedbackRating?: (number | null)[];
  feedbackComment?: string[];
};

export type ProgramDay = {
  id: string;
  label: string;
  modules: ProgramModule[];
};

export type ProgramWeek = {
  id: string;
  label: string;
  focus: string;
  days: ProgramDay[];
};

type WeekScheduleViewProps = {
  week?: ProgramWeek;
  weekNumber: number;
  title?: string;
  focusLabel?: string;
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

const formatDistance = (distanceMeters?: number[]) =>
  distanceMeters && distanceMeters.length > 0
    ? `${distanceMeters.join(", ")} m`
    : "-";

const formatWeight = (weightKg?: number[]) =>
  weightKg && weightKg.length > 0 ? `${weightKg.join(", ")} kg` : "-";

export function WeekScheduleView({
  week,
  weekNumber,
  title,
  focusLabel = "Fokus",
  emptyWeekTitle = "Inget program",
  emptyWeekDescription = "Ingen data för veckan.",
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] = useState<ProgramModule | null>(
    null
  );
  const [feedbackResponses, setFeedbackResponses] = useState<
    Record<
      string,
      { numericValues: string[]; ratings: string[]; comments: string[] }
    >
  >({});
  const heading =
    title ??
    (week
      ? week.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  const ensureFeedbackResponse = (module: ProgramModule) => {
    setFeedbackResponses((prev) => {
      if (prev[module.id]) return prev;

      const numericCount = module.feedbackNumericValue?.length ?? 0;
      const ratingCount = module.feedbackRating?.length ?? 0;
      const commentCount = module.feedbackComment?.length ?? 0;

      return {
        ...prev,
        [module.id]: {
          numericValues: Array.from({ length: numericCount }, () => ""),
          ratings: Array.from({ length: ratingCount }, () => ""),
          comments: Array.from({ length: commentCount }, () => ""),
        },
      };
    });
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="grid grid-cols-3 items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">{heading}</h2>
            <p className="text-sm text-base-content/70">
              {week ? `${focusLabel}: ${week.focus}` : emptyWeekDescription}
            </p>
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
                  {day.modules.map((module, index) => (
                    <button
                      key={`${day.id}-${index}-${module.title}`}
                      type="button"
                      onClick={() => {
                        ensureFeedbackResponse(module);
                        setSelectedModule(module);
                      }}
                      className="group w-full text-left"
                    >
                      <div className="space-y-2 rounded-xl border border-base-200 bg-base-100 p-3 transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-base-content">
                            {module.title}
                          </p>
                        </div>
                        <p className="text-xs text-base-content/70">
                          {module.description}
                        </p>
                        <ModuleBadges module={module}/>
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
            ))}
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

                {selectedModule.subcategory?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Underkategori
                    </p>
                    <p className="text-sm text-base-content/80">
                      {selectedModule.subcategory.join(", ")}
                    </p>
                  </div>
                ) : null}

                {selectedModule.distanceMeters?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Distans
                    </p>
                    <p className="text-sm text-base-content/80">
                      {formatDistance(selectedModule.distanceMeters)}
                    </p>
                  </div>
                ) : null}

                {selectedModule.weightKg?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Vikt
                    </p>
                    <p className="text-sm text-base-content/80">
                      {formatWeight(selectedModule.weightKg)}
                    </p>
                  </div>
                ) : null}

                {selectedModule.duration?.length ? (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Tid
                    </p>
                    <p className="text-sm text-base-content/80">
                      {selectedModule.duration
                        .map((entry) => formatDuration(entry.minutes, entry.seconds))
                        .join(", ")}
                    </p>
                  </div>
                ) : null}
              </div>

              {(selectedModule.feedbackDescription?.length ||
                selectedModule.feedbackNumericValue?.length ||
                selectedModule.feedbackRating?.length ||
                selectedModule.feedbackComment?.length) && (
                <div className="space-y-3 border-t border-base-200 pt-3">
                  <p className="text-sm font-semibold text-base-content">
                    Feedback att fylla i
                  </p>

                  {selectedModule.feedbackDescription?.some((entry) =>
                    entry.trim()
                  ) ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-neutral">
                        Instruktioner
                      </p>
                      <ul className="list-disc space-y-1 pl-4 text-sm text-base-content/80">
                        {selectedModule.feedbackDescription.map((item, index) => {
                          const value = item.trim();
                          if (!value) return null;

                          return <li key={`desc-${index}`}>{value}</li>;
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {selectedModule.feedbackNumericValue?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-neutral">
                        Numeriska värden
                      </p>
                      {selectedModule.feedbackNumericValue.map((_, index) => (
                        <label
                          key={`numeric-${index}`}
                          className="form-control flex flex-col gap-1"
                        >
                          <span className="label-text text-xs text-base-content/70">
                            Värde #{index + 1}
                          </span>
                          <input
                            type="number"
                            className="input input-sm input-bordered"
                            value={
                              feedbackResponses[selectedModule.id]?.numericValues[
                                index
                              ] ?? ""
                            }
                            onChange={(event) =>
                              setFeedbackResponses((prev) => {
                                const current = prev[selectedModule.id] ?? {
                                  numericValues: [],
                                  ratings: [],
                                  comments: [],
                                };

                                const numericValues = [...current.numericValues];
                                numericValues[index] = event.target.value;

                                return {
                                  ...prev,
                                  [selectedModule.id]: {
                                    ...current,
                                    numericValues,
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {selectedModule.feedbackRating?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-neutral">
                        Betygsskala (1-10)
                      </p>
                      {selectedModule.feedbackRating.map((_, index) => (
                        <label
                          key={`rating-${index}`}
                          className="form-control flex flex-col gap-1"
                        >
                          <span className="label-text text-xs text-base-content/70">
                            Betyg #{index + 1}
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            className="input input-sm input-bordered"
                            value={
                              feedbackResponses[selectedModule.id]?.ratings[index] ??
                              ""
                            }
                            onChange={(event) =>
                              setFeedbackResponses((prev) => {
                                const current = prev[selectedModule.id] ?? {
                                  numericValues: [],
                                  ratings: [],
                                  comments: [],
                                };

                                const ratings = [...current.ratings];
                                ratings[index] = event.target.value;

                                return {
                                  ...prev,
                                  [selectedModule.id]: { ...current, ratings },
                                };
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {selectedModule.feedbackComment?.length ? (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-neutral">
                        Kommentarer
                      </p>
                      {selectedModule.feedbackComment.map((_, index) => (
                        <label
                          key={`comment-${index}`}
                          className="form-control flex flex-col gap-1"
                        >
                          <span className="label-text text-xs text-base-content/70">
                            Kommentar #{index + 1}
                          </span>
                          <textarea
                            className="textarea textarea-bordered"
                            rows={2}
                            value={
                              feedbackResponses[selectedModule.id]?.comments[index] ??
                              ""
                            }
                            onChange={(event) =>
                              setFeedbackResponses((prev) => {
                                const current = prev[selectedModule.id] ?? {
                                  numericValues: [],
                                  ratings: [],
                                  comments: [],
                                };

                                const comments = [...current.comments];
                                comments[index] = event.target.value;

                                return {
                                  ...prev,
                                  [selectedModule.id]: { ...current, comments },
                                };
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
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
