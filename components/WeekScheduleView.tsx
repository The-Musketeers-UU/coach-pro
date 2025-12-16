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
  feedbackFields?: FeedbackFieldDefinition[];
  feedbackResponses?: FeedbackResponse[];
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

export type FeedbackFieldKey =
  | "distance"
  | "duration"
  | "weight"
  | "comment"
  | "feeling"
  | "sleepHours";

export type FeedbackFieldDefinition = {
  id: string;
  type: FeedbackFieldKey;
  label?: string | null;
};

export type FeedbackResponse = {
  fieldId: string;
  type: FeedbackFieldKey;
  value: number | string | null;
};

export type FeedbackFormState = Record<
  string,
  {
    id: string;
    type: FeedbackFieldKey;
    label?: string | null;
    active: boolean;
    value: string;
  }
>;

const DEFAULT_DAY_LABELS = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

const EMPTY_WEEK_DAYS: ProgramDay[] = DEFAULT_DAY_LABELS.map(
  (label, index) => ({
    id: `empty-day-${index + 1}`,
    label,
    dayNumber: index + 1,
    modules: [],
  })
);

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

  const daysToRender = useMemo(
    () => weekState?.days ?? EMPTY_WEEK_DAYS,
    [weekState]
  );

  const dayDateById = useMemo(() => {
    const map = new Map<string, Date>();

    daysToRender.forEach((day, index) => {
      const dayNumber = day.dayNumber ?? index + 1;
      const date = new Date(weekDateRange.start);
      date.setUTCDate(weekDateRange.start.getUTCDate() + dayNumber - 1);
      date.setHours(0, 0, 0, 0);
      map.set(day.id, date);
    });

    return map;
  }, [daysToRender, weekDateRange.start]);

  const isAthlete = viewerRole === "athlete";

  void _athleteId;
  void _coachId;

  useEffect(() => {
    setWeekState(week);
  }, [week]);

  void _athleteId;
  void _coachId;

  useEffect(() => {
    setWeekState(week);
  }, [week]);

  useEffect(() => {
    if (daysToRender.length === 0) {
      setSelectedDayId(null);
      return;
    }

    setSelectedDayId((current) => {
      if (daysToRender.some((day) => day.id === current)) {
        return current;
      }

      return daysToRender[0]?.id ?? null;
    });
  }, [daysToRender]);

  const feedbackDefaults = useMemo(() => {
    if (!selectedModule) return null;

    const { module } = selectedModule;

    const responsesById = new Map(
      (module.feedbackResponses ?? []).map((response) => [
        response.fieldId,
        response,
      ])
    );

    const formatValue = (
      field: FeedbackFieldKey,
      value: number | string | null | undefined
    ) => {
      if (value === null || value === undefined) return "";

      if (field === "duration") {
        return formatCentiseconds(Number(value));
      }

      return String(value);
    };

    const defaults: FeedbackFormState = {};

    (module.feedbackFields ?? []).forEach((field) => {
      const matchedResponse = responsesById.get(field.id);
      defaults[field.id] = {
        id: field.id,
        type: field.type,
        label: field.label,
        active: true,
        value: formatValue(field.type, matchedResponse?.value ?? null),
      };
    });

    return defaults;
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

  const handleFeedbackChange = (
    fieldId: string,
    updater: (current: FeedbackFormState[string]) => FeedbackFormState[string]
  ) => {
    setFeedbackForm((prev) => {
      if (!prev || !prev[fieldId]) return prev;
      return { ...prev, [fieldId]: updater(prev[fieldId]) };
    });
  };

  const formatSavePayload = () => {
    if (
      !feedbackForm ||
      !selectedModule?.module.id ||
      !selectedModule.module.scheduleDayId
    )
      return null;

    const responses = Object.values(feedbackForm).map((fieldState) => {
      const toNumber = (value: string) => {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
      };

      const toDuration = (value: string) => {
        const parsed = parseDurationToCentiseconds(value);
        return parsed === undefined ? null : parsed;
      };

      const parsedValue = (() => {
        if (!fieldState.active) return null;

        if (fieldState.type === "duration") {
          return toDuration(fieldState.value);
        }

        if (fieldState.type === "comment") {
          return fieldState.value.trim() || null;
        }

        return toNumber(fieldState.value);
      })();

      return {
        fieldId: fieldState.id,
        type: fieldState.type,
        value: parsedValue,
      } satisfies FeedbackResponse;
    });

    return {
      moduleId: selectedModule.module.id,
      scheduleDayId: selectedModule.module.scheduleDayId,
      responses,
    } as const;
  };

  const handleSaveFeedback = async () => {
    const payload = formatSavePayload();
    if (!payload) return;

    setIsSubmittingFeedback(true); // <-- var setIsSavingFeedback i main
    setFeedbackError(null);

    try {
      const updated = await upsertScheduleModuleFeedback(payload);

      setWeekState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          days: prev.days.map((day) => ({
            ...day,
            modules: day.modules.map((module) =>
              module.id === payload.moduleId &&
              module.scheduleDayId === payload.scheduleDayId
                ? {
                    ...module,
                    feedbackResponses: updated.responses,
                  }
                : module
            ),
          })),
        } satisfies ProgramWeek;
      });

      setSelectedModule((prev) =>
        prev
          ? {
              ...prev,
              module: {
                ...prev.module,
                feedback: {
                  distance: updated.distance,
                  duration: updated.duration,
                  weight: updated.weight,
                  comment: updated.comment,
                  feeling: updated.feeling,
                  sleepHours: updated.sleepHours,
                },
              },
            }
          : prev
      );
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSubmittingFeedback(false); // <-- var setIsSavingFeedback i main
    }
  };

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
        responses: Object.values(feedbackForm).map((fieldState) => {
          const toNumber = (value: string) => {
            const parsed = Number.parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
          };

          const toDuration = (value: string) => {
            const parsed = parseDurationToCentiseconds(value);
            return parsed === undefined ? null : parsed;
          };

          const value = (() => {
            if (!fieldState.active) return null;

            if (fieldState.type === "duration") {
              return toDuration(fieldState.value);
            }

            if (fieldState.type === "comment") {
              return fieldState.value.trim() || null;
            }

            return toNumber(fieldState.value);
          })();

          return {
            fieldId: fieldState.id,
            type: fieldState.type,
            value,
          };
        }),
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
    const selectedTypes = new Set(
      (module.feedbackFields ?? []).map((f) => f.type)
    );

    const responsesByType = new Map(
      (module.feedbackResponses ?? []).map((r) => [r.type, r.value] as const)
    );

    const relevantFields = (
      Object.keys(FEEDBACK_FIELDS) as FeedbackFieldKey[]
    ).filter(
      (field) => selectedTypes.has(field) || module[field] !== undefined
    );

    if (relevantFields.length === 0) return false;

    // Om det finns relevanta fält men inga responses alls: pending
    if ((module.feedbackResponses ?? []).length === 0) return true;

    // Pending om något relevant fält saknar svar (null/undefined)
    return relevantFields.some((field) => {
      const value = responsesByType.get(field);
      return value === null || value === undefined;
    });
  };

  const selectedDay =
    daysToRender.find((day) => day.id === selectedDayId) ?? daysToRender[0];

  const selectedModuleDayDate = useMemo(() => {
    if (!selectedModule?.module.scheduleDayId) return null;

    return dayDateById.get(selectedModule.module.scheduleDayId) ?? null;
  }, [dayDateById, selectedModule?.module.scheduleDayId]);

  const hasSelectedModulePendingFeedback = useMemo(() => {
    if (!selectedModule) return false;

    const isPastDay = selectedModuleDayDate
      ? selectedModuleDayDate.getTime() <= today.getTime()
      : false;

    return isPastDay && hasPendingFeedback(selectedModule.module);
  }, [hasPendingFeedback, selectedModule, selectedModuleDayDate, today]);

  const renderDayColumn = (day: ProgramDay) => {
    const dayDate = dayDateById.get(day.id);
    const dayNumberLabel = dayDate ? dayDate.getUTCDate().toString() : "";
    const isToday = dayDate ? dayDate.getTime() === today.getTime() : false;

    return (
      <article
        key={day.id}
        className={`flex min-h-[600px] flex-col rounded-2xl border border-base-200 bg-base-300 p-2 ${
          isToday ? " ring-2 ring-primary/40" : ""
        }`}
      >
        <div className="flex items-center gap-4 ml-1">
          <div>
            <p className="text-sm uppercase tracking-wide text-neutral">
              {day.label}
            </p>
          </div>
          {dayNumberLabel && (
            <p className=" text-xs font-semibold text-base-content/70">
              {dayNumberLabel}
            </p>
          )}
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
                  const isPastDay = dayDate
                    ? dayDate.getTime() <= today.getTime()
                    : false;
                  const showPending = isPastDay && hasPendingFeedback(module);

                  if (!showPending) return null;

                  return (
                    <span
                      className="indicator-item indicator-top indicator-end translate-x-0 translate-y-0 status status-info"
                      aria-label="Feedback saknas"
                    />
                  );
                })()}

                <div className=" w-full space-y-2 rounded-xl border border-base-200 bg-base-100 p-3 transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
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
  };

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

        <div className="md:hidden -mx-4 sm:-mx-6">
          <div className="flex w-full items-center overflow-x-auto border border-base-300 bg-base-100">
            {daysToRender.map((day) => (
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
          {daysToRender.map((day) => renderDayColumn(day))}
        </div>
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

            <div className="grid gap-4 md:grid-cols-[minmax(300px,1fr)_minmax(300px,0.5fr)]">
              <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Beskrivning
                  </p>
                  <div className="h-70 rounded-lg border border-base-200 bg-base-100/70 p-3 overflow-y-auto">
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
                    <p className="badge badge-sm capitalize badge-accent">
                      {selectedModule.module.category || "-"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-neutral">
                      Underkategori
                    </p>
                    <p className="badge badge-sm capitalize badge-accent badge-outline">
                      {selectedModule.module.subcategory || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase font-semibold tracking-wide text-neutral">
                    Din feedback
                  </p>

                  {hasSelectedModulePendingFeedback && (
                    <div className="flex items-center gap-2 text-sm text-info">
                      <span className="status status-info" aria-hidden />
                      <span className="font-medium text-xs">
                        Lämna feedback
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {feedbackForm &&
                    (selectedModule.module.feedbackFields ?? []).length ===
                      0 && (
                      <p className="text-sm text-base-content/70">
                        Inga feedbackfält valda för detta pass.
                      </p>
                    )}

                  {feedbackForm &&
                    (selectedModule.module.feedbackFields ?? []).map(
                      (field) => {
                        const fieldState = feedbackForm[field.id];
                        if (!fieldState) return null;

                        if (viewerRole === "athlete" && !fieldState.active)
                          return null;

                        const fieldMeta = FEEDBACK_FIELDS[field.type];
                        const label =
                          fieldState.label?.trim() || fieldMeta.label;

                        return (
                          <div
                            key={field.id}
                            className="rounded-lg border border-base-200 p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-sm"
                                  checked={fieldState.active}
                                  disabled={!isAthlete}
                                  onChange={(event) =>
                                    handleFeedbackChange(
                                      field.id,
                                      (current) => ({
                                        ...current,
                                        active: event.target.checked,
                                        value: event.target.checked
                                          ? current.value
                                          : "",
                                      })
                                    )
                                  }
                                />
                                <span className="text-sm font-semibold">
                                  {label}
                                </span>
                              </div>
                              <span className="text-xs text-base-content/70">
                                {fieldState.active ? "Aktiverad" : "Av"}
                              </span>
                            </div>

                            {fieldState.active && (
                              <div>
                                {fieldMeta.type === "textarea" ? (
                                  <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder={fieldMeta.placeholder}
                                    value={fieldState.value}
                                    readOnly={!isAthlete}
                                    disabled={!isAthlete}
                                    onChange={(event) =>
                                      handleFeedbackChange(
                                        field.id,
                                        (current) => ({
                                          ...current,
                                          value: event.target.value,
                                        })
                                      )
                                    }
                                    rows={2}
                                  />
                                ) : (
                                  <input
                                    className="input input-bordered input-sm w-full"
                                    type={fieldMeta.type}
                                    step={fieldMeta.step}
                                    min={fieldMeta.min}
                                    max={fieldMeta.max}
                                    placeholder={fieldMeta.placeholder}
                                    value={fieldState.value}
                                    readOnly={!isAthlete}
                                    disabled={!isAthlete}
                                    onChange={(event) =>
                                      handleFeedbackChange(
                                        field.id,
                                        (current) => ({
                                          ...current,
                                          value: event.target.value,
                                        })
                                      )
                                    }
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
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
          </div>
        </dialog>
      )}
    </div>
  );
}
