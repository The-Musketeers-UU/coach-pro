"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { upsertScheduleModuleFeedback } from "@/lib/supabase/training-modules";
import { formatCentiseconds, parseDurationToCentiseconds } from "@/lib/time";
import { getDateRangeForIsoWeek } from "@/lib/week";

import { ModuleBadges } from "@/components/ModuleBadges";

export type ProgramModule = {
  id?: string;
  scheduleDayId?: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  distance?: number | null;
  weight?: number | null;
  duration?: number | null;
  comment?: string | null;
  feeling?: number | null;
  sleepHours?: number | null;
  feedback?: {
    distance: number | null;
    weight: number | null;
    duration: number | null;
    comment: string | null;
    feeling: number | null;
    sleepHours: number | null;
  };
};

export type ProgramDay = {
  id: string;
  label: string;
  dayNumber?: number;
  modules: ProgramModule[];
};

export type ProgramWeek = {
  id: string;
  label: string;
  focus?: string;
  days: ProgramDay[];
};

type SelectedModuleState = {
  module: ProgramModule;
  key: string;
};

type WeekScheduleViewProps = {
  week?: ProgramWeek;
  weekNumber: number;
  title?: string;
  headerAction?: ReactNode;
  emptyWeekTitle?: string;
  emptyWeekDescription?: string;
  viewerRole?: "coach" | "athlete";
  athleteId?: string;
  coachId?: string;
};

type FeedbackFieldKey =
  | "distance"
  | "duration"
  | "weight"
  | "comment"
  | "feeling"
  | "sleepHours";

type FeedbackFormState = Record<
  FeedbackFieldKey,
  { active: boolean; value: string }
>;

const FEEDBACK_FIELDS: Record<
  FeedbackFieldKey,
  {
    label: string;
    placeholder: string;
    type: string;
    step?: number;
    min?: number;
    max?: number;
    options?: { value: string; label: string }[];
  }
> = {
  distance: {
    label: "Distans (m)",
    placeholder: "",
    type: "number",
    step: 10,
    min: 0,
  },
  duration: {
    label: "Tid (mm:ss.hh)",
    placeholder: "",
    type: "text",
  },
  weight: {
    label: "Vikt (kg)",
    placeholder: "",
    type: "number",
    step: 1,
    min: 0,
  },
  comment: {
    label: "Kommentar",
    placeholder: "",
    type: "textarea",
  },
  feeling: {
    label: "Känsla (1-10)",
    placeholder: "",
    type: "select",
    options: Array.from({ length: 10 }, (_, index) => {
      const value = `${index + 1}`;
      return { value, label: value };
    }),
  },
  sleepHours: {
    label: "Sömn (timmar)",
    placeholder: "",
    type: "number",
    step: 0.5,
    min: 0,
  },
};

export function WeekScheduleView({
  week,
  weekNumber,
  title,
  headerAction,
  emptyWeekTitle = "Inget program",
  emptyWeekDescription = "Ingen data for veckan.",
  viewerRole,
  athleteId: _athleteId,
  coachId: _coachId,
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] =
    useState<SelectedModuleState | null>(null);
  const [weekState, setWeekState] = useState<ProgramWeek | undefined>(week);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState | null>(
    null
  );
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    week?.days[0]?.id ?? null
  );

  const weekDateRange = useMemo(
    () => getDateRangeForIsoWeek(weekNumber, new Date()),
    [weekNumber]
  );
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const dayDateById = useMemo(() => {
    const map = new Map<string, Date>();

    if (!weekState) return map;

    weekState.days.forEach((day, index) => {
      const dayNumber = day.dayNumber ?? index + 1;
      const date = new Date(weekDateRange.start);
      date.setUTCDate(weekDateRange.start.getUTCDate() + dayNumber - 1);
      date.setHours(0, 0, 0, 0);
      map.set(day.id, date);
    });

    return map;
  }, [weekDateRange.start, weekState]);

  const isAthlete = viewerRole === "athlete";
  void _athleteId;
  void _coachId;

  useEffect(() => {
    setWeekState(week);
  }, [week]);

  useEffect(() => {
    if (!weekState || weekState.days.length === 0) {
      setSelectedDayId(null);
      return;
    }

    setSelectedDayId((current) => {
      if (weekState.days.some((day) => day.id === current)) {
        return current;
      }

      return weekState.days[0]?.id ?? null;
    });
  }, [weekState]);

  const feedbackDefaults = useMemo(() => {
    if (!selectedModule) return null;

    const { module } = selectedModule;
    const buildValue = (
      field: FeedbackFieldKey,
      value: number | string | null | undefined
    ) => {
      if (value === null || value === undefined) return "";

      if (field === "duration") {
        return formatCentiseconds(Number(value));
      }

      return String(value);
    };

    const toFieldState = (
      field: FeedbackFieldKey,
      templateValue: unknown,
      feedbackValue: unknown
    ): { active: boolean; value: string } => {
      const resolvedValue =
        feedbackValue !== undefined ? feedbackValue : templateValue;

      return {
        active: templateValue !== undefined || feedbackValue !== undefined,
        value: buildValue(field, resolvedValue as number | string | null),
      };
    };

    return {
      distance: toFieldState(
        "distance",
        module.distance,
        module.feedback?.distance
      ),
      duration: toFieldState(
        "duration",
        module.duration,
        module.feedback?.duration
      ),
      weight: toFieldState("weight", module.weight, module.feedback?.weight),
      comment: toFieldState(
        "comment",
        module.comment,
        module.feedback?.comment
      ),
      feeling: toFieldState(
        "feeling",
        module.feeling,
        module.feedback?.feeling
      ),
      sleepHours: toFieldState(
        "sleepHours",
        module.sleepHours,
        module.feedback?.sleepHours
      ),
    } satisfies FeedbackFormState;
  }, [selectedModule]);

  useEffect(() => {
    if (feedbackDefaults) {
      setFeedbackForm(feedbackDefaults);
    }
    setFeedbackError(null);
    setIsSubmittingFeedback(false);
  }, [feedbackDefaults]);

  const hasFeedbackChanges = useMemo(() => {
    if (!feedbackForm || !feedbackDefaults) return false;

    return (Object.keys(feedbackForm) as FeedbackFieldKey[]).some((field) => {
      return feedbackForm[field].value !== feedbackDefaults[field].value;
    });
  }, [feedbackDefaults, feedbackForm]);

  const updateFeedbackValue = (field: FeedbackFieldKey, value: string) =>
    setFeedbackForm((current) =>
      current
        ? {
            ...current,
            [field]: { ...current[field], value },
          }
        : current
    );

  const prepareFeedbackPayload = () => {
    if (!selectedModule || !feedbackForm) return null;

    const parseNumberField = (field: FeedbackFieldKey) => {
      const rawValue = feedbackForm[field].value.trim();
      if (!rawValue) return null;

      const parsed = Number.parseFloat(rawValue.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const distance = parseNumberField("distance");
    if (distance === undefined) return { error: "Ogiltig distans." } as const;

    const weight = parseNumberField("weight");
    if (weight === undefined) return { error: "Ogiltig vikt." } as const;

    const feeling = parseNumberField("feeling");
    if (feeling === undefined) return { error: "Ogiltig känsla." } as const;

    const sleepHours = parseNumberField("sleepHours");
    if (sleepHours === undefined) return { error: "Ogiltig sömn." } as const;

    const durationValue = feedbackForm.duration.value.trim();
    const duration = durationValue
      ? parseDurationToCentiseconds(durationValue)
      : null;

    if (duration === undefined) return { error: "Ogiltig tid." } as const;

    return {
      payload: {
        moduleId: selectedModule.module.id ?? "",
        scheduleDayId: selectedModule.module.scheduleDayId ?? "",
        distance,
        duration,
        weight,
        comment: feedbackForm.comment.value.trim() || null,
        feeling,
        sleepHours,
      },
    } as const;
  };

  const persistFeedback = async () => {
    if (!isAthlete) return;

    const prepared = prepareFeedbackPayload();
    if (!prepared) return;

    if (prepared.error) {
      setFeedbackError(prepared.error);
      return;
    }

    const { payload } = prepared;

    if (!payload.moduleId || !payload.scheduleDayId) {
      setFeedbackError("Saknar modul- eller dagreferens för feedback.");
      return;
    }

    setFeedbackError(null);
    setIsSubmittingFeedback(true);

    try {
      const updatedFeedback = await upsertScheduleModuleFeedback(payload);

      setWeekState((current) => {
        if (!current) return current;

        return {
          ...current,
          days: current.days.map((day) =>
            day.id === payload.scheduleDayId
              ? {
                  ...day,
                  modules: day.modules.map((module) =>
                    module.id === payload.moduleId
                      ? {
                          ...module,
                          feedback: updatedFeedback,
                        }
                      : module
                  ),
                }
              : day
          ),
        };
      });

      setSelectedModule((current) =>
        current
          ? {
              ...current,
              module: { ...current.module, feedback: updatedFeedback },
            }
          : current
      );
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : "Kunde inte spara feedback."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const heading =
    title ??
    (weekState
      ? weekState.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  const hasPendingFeedback = (module: ProgramModule) => {
    const relevantFields = (Object.keys(FEEDBACK_FIELDS) as FeedbackFieldKey[]).filter(
      (field) => {
        const templateValue = module[field];
        const feedbackValue = module.feedback?.[field];

        return templateValue !== undefined || feedbackValue !== undefined;
      }
    );

    if (relevantFields.length === 0) return false;
    if (!module.feedback) return true;

    return relevantFields.some((field) => {
      const feedbackValue = module.feedback?.[field];

      return feedbackValue === null || feedbackValue === undefined;
    });
  };

  const selectedDay =
    weekState?.days.find((day) => day.id === selectedDayId) ??
    weekState?.days[0];

  const renderDayColumn = (day: ProgramDay) => (
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
              const moduleKey = module.id ?? `${day.id}-${index}`;
              setSelectedModule({ module, key: moduleKey });
            }}
            className="group w-full text-left"
          >
            <div className="indicator w-full text-left">
              {(() => {
                const dayDate = dayDateById.get(day.id);
                const isPastDay = dayDate ? dayDate.getTime() < today.getTime() : false;
                const showPending = isPastDay && hasPendingFeedback(module);

                if (!showPending) return null;

                return (
                  <span
                    className="indicator-item indicator-start -translate-x-2 -translate-y-2 badge badge-info badge-xs border-transparent"
                    aria-label="Feedback saknas"
                  />
                );
              })()}

              <div className="space-y-2 rounded-xl border border-base-200 bg-base-100 p-3 transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
            </div>
          </button>
        ))}
      </div>
    </article>
  );

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{heading}</h2>
            {weekState?.focus && (
              <p className="text-sm text-base-content/70">{weekState.focus}</p>
            )}
          </div>

          {headerAction && (
            <div className="flex items-center justify-end">{headerAction}</div>
          )}
        </div>

        {weekState ? (
          <>
            <div className="md:hidden -mx-4 sm:-mx-6">
              <div className="flex w-full items-center overflow-x-auto border border-base-300 bg-base-100">
                {weekState.days.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDayId(day.id)}
                    className={`btn btn-sm w-full flex-1 whitespace-nowrap ${
                      selectedDay?.id === day.id
                        ? "btn-primary btn-soft"
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
                  {renderDayColumn(selectedDay)}
                </div>
              )}
            </div>

            <div className="hidden grid-cols-1 gap-1 md:grid md:grid-cols-2 xl:grid-cols-7">
              {weekState.days.map((day) => renderDayColumn(day))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-6 text-center text-sm text-base-content/70 space-y-1">
            <p className="font-semibold text-base-content">
              {emptyWeekTitle || `Vecka ${weekNumber}`}
            </p>
            <p>{emptyWeekDescription}</p>
          </div>
        )}
      </div>

      {selectedModule && (
        <dialog
          className="modal modal-open"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedModule(null);
            }
          }}
        >
          <div className="modal-box max-w-3xl space-y-4">
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
                x
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)]">
              <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Beskrivning
                  </p>
                  <div className="h-40 rounded-lg border border-base-200 bg-base-100/70 p-3 overflow-y-auto">
                    <p className="text-sm leading-relaxed text-base-content/80">
                      {selectedModule.module.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Kategori
                    </p>
                    <p className="badge capitalize badge-accent">
                      {selectedModule.module.category || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Underkategori
                    </p>
                    <p className="badge capitalize badge-accent badge-outline">
                      {selectedModule.module.subcategory || "-"}
                    </p>
                  </div>
                </div>

                {(selectedModule.module.comment ||
                  selectedModule.module.feeling ||
                  selectedModule.module.sleepHours) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedModule.module.comment && (
                      <div className="sm:col-span-2 space-y-1">
                        <p className="text-xs uppercase tracking-wide text-neutral">
                          Kommentar
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-base-content/80">
                          {selectedModule.module.comment}
                        </p>
                      </div>
                    )}

                    {selectedModule.module.feeling && (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-neutral">
                          Känsla
                        </p>
                        <p className="text-sm text-base-content/80">
                          {selectedModule.module.feeling}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className=" rounded-2xl border border-base-300 bg-base-100 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral pb-2">
                  Din feedback
                </p>

                <div className="space-y-2">
                  {feedbackForm &&
                    (
                      [
                        "distance",
                        "duration",
                        "weight",
                        "feeling",
                        "sleepHours",
                      ] as FeedbackFieldKey[]
                    ).map((field) => {
                      const fieldState = feedbackForm[field];
                      const fieldMeta = FEEDBACK_FIELDS[field];

                      if (!fieldState.active) return null;

                      return (
                        <div
                          key={field}
                          className="rounded-lg border border-base-200 px-3 py-2"
                        >
                          <label className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-neutral">
                            <span>{fieldMeta.label}</span>
                            {fieldMeta.type === "select" ? (
                              <select
                                className="select select-bordered select-sm w-28 text-right"
                                disabled={!isAthlete}
                                value={fieldState.value}
                                onChange={(event) =>
                                  updateFeedbackValue(field, event.target.value)
                                }
                              >
                                <option value="">-</option>
                                {fieldMeta.options?.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="input input-bordered input-sm w-28 text-right"
                                type={
                                  fieldMeta.type === "textarea"
                                    ? "text"
                                    : fieldMeta.type
                                }
                                step={fieldMeta.step}
                                min={fieldMeta.min}
                                max={fieldMeta.max}
                                placeholder={fieldMeta.placeholder}
                                value={fieldState.value}
                                readOnly={!isAthlete}
                                disabled={!isAthlete}
                                onChange={(event) =>
                                  updateFeedbackValue(field, event.target.value)
                                }
                              />
                            )}
                          </label>
                        </div>
                      );
                    })}

                  {feedbackForm?.comment.active && (
                    <div className="space-y-2 rounded-lg border border-base-200 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral">
                        Kommentar
                      </p>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder={FEEDBACK_FIELDS.comment.placeholder}
                        value={feedbackForm.comment.value}
                        readOnly={!isAthlete}
                        disabled={!isAthlete}
                        onChange={(event) =>
                          updateFeedbackValue("comment", event.target.value)
                        }
                        rows={3}
                      />
                    </div>
                  )}

                  {!feedbackForm && (
                    <p className="text-sm text-base-content/70">
                      Ingen feedback tillgänglig.
                    </p>
                  )}
                </div>

                {feedbackError && (
                  <div className="alert alert-error py-2 text-sm">
                    {feedbackError}
                  </div>
                )}

                {isAthlete && (
                  <div className="flex items-center justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={persistFeedback}
                      type="button"
                      disabled={isSubmittingFeedback || !hasFeedbackChanges}
                    >
                      {isSubmittingFeedback ? "Sparar..." : "Spara feedback"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                className="btn btn-sm"
                onClick={() => setSelectedModule(null)}
                type="button"
              >
                Stäng
              </button>
            </div>

            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setSelectedModule(null)}>close</button>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
