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
  hadUnreadFeedback?: boolean;
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
  athleteId,
  coachId,
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] =
    useState<SelectedModuleState | null>(null);
  const [weekState, setWeekState] = useState<ProgramWeek | undefined>(week);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState | null>(
    null
  );
  const [reviewedFeedbackSignatures, setReviewedFeedbackSignatures] =
    useState<Map<string, string>>(() => new Map());
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    week?.days[0]?.id ?? null
  );

  const feedbackSignatureStorageKey = useMemo(() => {
    const roleKey = viewerRole ?? "unknown";
    const athleteKey = athleteId ?? "any";
    const coachKey = coachId ?? "self";

    return `reviewedFeedbackSignatures:${roleKey}:${coachKey}:${athleteKey}`;
  }, [athleteId, coachId, viewerRole]);

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

  useEffect(() => {
    setWeekState(week);
  }, [week]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(feedbackSignatureStorageKey);
    if (!stored) return;

    try {
      const entries = JSON.parse(stored) as [string, string][];
      setReviewedFeedbackSignatures(new Map(entries));
    } catch (error) {
      console.error("Failed to parse feedback signatures", error);
    }
  }, [feedbackSignatureStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const entries = Array.from(reviewedFeedbackSignatures.entries());
    window.localStorage.setItem(
      feedbackSignatureStorageKey,
      JSON.stringify(entries)
    );
  }, [feedbackSignatureStorageKey, reviewedFeedbackSignatures]);

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
      const current = feedbackForm[field];
      const defaults = feedbackDefaults[field];

      if (!current || !defaults) return false;

      return current.value !== defaults.value;
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
                feedbackResponses: updated.responses,
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
      const fieldState = feedbackForm[field];
      if (!fieldState) return null;

      const rawValue = fieldState.value.trim();
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

    const durationValue = feedbackForm.duration?.value.trim() ?? "";
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
                          feedbackResponses: updatedFeedback.responses,
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
              module: {
                ...current.module,
                feedback: updatedFeedback,
                feedbackResponses: updatedFeedback.responses,
              },
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
    const selectedFields = module.feedbackFields ?? [];
    if (selectedFields.length === 0) return false;

    const selectedTypes = new Set(selectedFields.map((f) => f.type));

    const responsesByType = new Map(
      (module.feedbackResponses ?? []).map((r) => [r.type, r.value] as const)
    );

    const relevantFields = (
      Object.keys(FEEDBACK_FIELDS) as FeedbackFieldKey[]
    ).filter((field) => selectedTypes.has(field));

    // Om det finns relevanta fält men inga responses alls: pending
    if ((module.feedbackResponses ?? []).length === 0) return true;

    // Pending om något relevant fält saknar svar (null/undefined)
    return relevantFields.some((field) => {
      const value = responsesByType.get(field);
      return value === null || value === undefined;
    });
  };

  const getFeedbackSignature = (module: ProgramModule) =>
    JSON.stringify(
      (module.feedbackResponses ?? []).map((response) => ({
        id: response.fieldId,
        type: response.type,
        value:
          typeof response.value === "string"
            ? response.value.trim()
            : response.value,
      }))
    );

  const hasUnreadFeedbackForCoach = (
    module: ProgramModule,
    moduleKey: string,
  ) => {
    const signature = getFeedbackSignature(module);
    if (signature === "[]") return false;

    const seenSignature = reviewedFeedbackSignatures.get(moduleKey);
    return seenSignature !== signature;
  };

  const selectedDay =
    daysToRender.find((day) => day.id === selectedDayId) ?? daysToRender[0];

  const selectedModuleDayDate = useMemo(() => {
    if (!selectedModule?.module.scheduleDayId) return null;

    return dayDateById.get(selectedModule.module.scheduleDayId) ?? null;
  }, [dayDateById, selectedModule?.module.scheduleDayId]);

  const hasSelectedModulePendingFeedback = useMemo(() => {
    if (!selectedModule || !isAthlete) return false;

    const isPastDay = selectedModuleDayDate
      ? selectedModuleDayDate.getTime() <= today.getTime()
      : false;

    return isPastDay && hasPendingFeedback(selectedModule.module);
  }, [hasPendingFeedback, selectedModule, selectedModuleDayDate, today]);

  const hasSelectedModuleUnreadFeedbackForCoach = useMemo(
    () => Boolean(!isAthlete && selectedModule?.hadUnreadFeedback),
    [isAthlete, selectedModule?.hadUnreadFeedback],
  );

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
                const hadUnreadFeedback =
                  viewerRole === "coach"
                    ? hasUnreadFeedbackForCoach(module, moduleKey)
                    : false;

                if (viewerRole === "coach") {
                  const signature = getFeedbackSignature(module);
                  setReviewedFeedbackSignatures((current) => {
                    const next = new Map(current);
                    next.set(moduleKey, signature);
                    return next;
                  });
                }

                setSelectedModule({
                  module,
                  key: moduleKey,
                  hadUnreadFeedback,
                });
              }}
              className="group w-full text-left"
            >
              <div className="indicator w-full text-left">
                {(() => {
                  const dayDate = dayDateById.get(day.id);
                  const isPastDay = dayDate
                    ? dayDate.getTime() <= today.getTime()
                    : false;
                  const moduleKey = module.id ?? `${day.id}-${index}`;

                  const showPending =
                    isAthlete && isPastDay && hasPendingFeedback(module);

                  const showUnreadForCoach =
                    !isAthlete && hasUnreadFeedbackForCoach(module, moduleKey);

                  if (!showPending && !showUnreadForCoach) return null;

                  const indicatorLabel = showPending
                    ? "Feedback saknas"
                    : "Ny feedback";

                  return (
                    <span
                      className="indicator-item indicator-top indicator-end translate-x-0 translate-y-0 status status-info"
                      aria-label={indicatorLabel}
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
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {selectedModule.module.title}
                </h3>

                {hasSelectedModuleUnreadFeedbackForCoach && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-info">
                    <span className="status status-info" aria-hidden />
                    <span>Ny feedback</span>
                  </div>
                )}
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

              <div className="flex h-full flex-col space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
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

                <div className="space-y-2 flex-1">
                  {feedbackForm &&
                    (() => {
                      const fields = selectedModule.module.feedbackFields ?? [];
                      const items: (
                        | {
                            kind: "distanceDuration";
                            distance: FeedbackFormState[string];
                            duration?: FeedbackFormState[string];
                          }
                        | { kind: "single"; field: FeedbackFormState[string] }
                      )[] = [];

                      for (let index = 0; index < fields.length; index += 1) {
                        const field = fields[index];
                        const fieldState = feedbackForm[field.id];
                        if (!fieldState) continue;

                        if (viewerRole === "athlete" && !fieldState.active) {
                          continue;
                        }

                        if (field.type === "distance") {
                          const nextField = fields[index + 1];
                          const durationState =
                            nextField?.type === "duration"
                              ? feedbackForm[nextField.id]
                              : undefined;

                          if (durationState) {
                            items.push({
                              kind: "distanceDuration",
                              distance: fieldState,
                              duration: durationState,
                            });
                            index += 1;
                            continue;
                          }
                        }

                        items.push({ kind: "single", field: fieldState });
                      }

                      const distanceItems = items.filter(
                        (item): item is {
                          kind: "distanceDuration";
                          distance: FeedbackFormState[string];
                          duration?: FeedbackFormState[string];
                        } => item.kind === "distanceDuration",
                      );

                      const weightItems = items.filter(
                        (item): item is { kind: "single"; field: FeedbackFormState[string] } =>
                          item.kind === "single" && item.field.type === "weight",
                      );

                      const otherItems = items.filter(
                        (item): item is { kind: "single"; field: FeedbackFormState[string] } =>
                          item.kind === "single" && item.field.type !== "weight",
                      );

                      const commentItems = otherItems.filter(
                        (item) => item.field.type === "comment",
                      );
                      const miscItems = otherItems.filter(
                        (item) => item.field.type !== "comment",
                      );

                      const renderSingleField = (
                        item: { kind: "single"; field: FeedbackFormState[string] },
                        options?: { compact?: boolean },
                      ) => {
                        const fieldMeta = FEEDBACK_FIELDS[item.field.type];
                        const label = item.field.label?.trim() || fieldMeta.label;

                        if (item.field.type === "comment") {
                          return (
                            <label
                              key={item.field.id}
                              className="flex flex-col gap-1 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-base-content/70">{label}</span>
                              </div>
                              <textarea
                                className="textarea textarea-bordered w-full"
                                placeholder={fieldMeta.placeholder}
                                value={item.field.value}
                                readOnly={!isAthlete}
                                disabled={!isAthlete}
                                onChange={(event) =>
                                  handleFeedbackChange(item.field.id, (current) => ({
                                    ...current,
                                    value: event.target.value,
                                  }))
                                }
                                rows={2}
                              />
                            </label>
                          );
                        }

                        if (fieldMeta.type === "select" && fieldMeta.options) {
                          return (
                            <label
                              key={item.field.id}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="text-xs text-base-content/70">{label}</span>
                              <select
                                className="select select-bordered select-sm w-28"
                                value={item.field.value}
                                disabled={!isAthlete}
                                onChange={(event) =>
                                  handleFeedbackChange(item.field.id, (current) => ({
                                    ...current,
                                    value: event.target.value,
                                  }))
                                }
                              >
                                <option value="">-</option>
                                {fieldMeta.options.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        }

                        return (
                          <label
                            key={item.field.id}
                            className={`flex items-center justify-between gap-3 text-xs ${
                              options?.compact
                                ? "rounded-lg bg-base-100 px-3 py-2"
                                : ""
                            }`}
                          >
                            <span className="text-xs text-base-content/70">{label}</span>
                            <input
                              className="input input-bordered input-sm w-28 text-right"
                              type={fieldMeta.type}
                              step={fieldMeta.step}
                              min={fieldMeta.min}
                              max={fieldMeta.max}
                              placeholder={fieldMeta.placeholder}
                              value={item.field.value}
                              readOnly={!isAthlete}
                              disabled={!isAthlete}
                              onChange={(event) =>
                                handleFeedbackChange(item.field.id, (current) => ({
                                  ...current,
                                  value: event.target.value,
                                }))
                              }
                            />
                          </label>
                        );
                      };

                      return (
                        <div className="space-y-3">
                          {distanceItems.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {distanceItems.map((item) => {
                                const durationLabel =
                                  item.duration?.label?.trim() || FEEDBACK_FIELDS.duration.label;

                                return (
                          <div
                            key={item.distance.id}
                            className="flex min-w-[280px] flex-1 flex-wrap items-center gap-4 rounded-lg bg-base-100 p-3"
                          >
                            <label className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-xs text-base-content/70">Distans</span>
                              <input
                                className="input input-bordered input-sm w-28"
                                        type="number"
                                        step={FEEDBACK_FIELDS.distance.step}
                                        min={FEEDBACK_FIELDS.distance.min}
                                        placeholder={FEEDBACK_FIELDS.distance.placeholder}
                                        value={item.distance.value}
                                        readOnly={!isAthlete}
                                        disabled={!isAthlete}
                                        onChange={(event) =>
                                          handleFeedbackChange(
                                            item.distance.id,
                                            (current) => ({
                                              ...current,
                                              value: event.target.value,
                                            }),
                                          )
                                        }
                                      />
                                    </label>

                            {item.duration && (
                              <label className="flex items-center justify-between gap-2 text-xs">
                                <span className="text-xs text-base-content/70">{durationLabel}</span>
                                <input
                                  className="input input-bordered input-sm w-28"
                                  type="text"
                                  placeholder={FEEDBACK_FIELDS.duration.placeholder}
                                  value={item.duration.value}
                                  readOnly={!isAthlete}
                                  disabled={!isAthlete}
                                  onChange={(event) =>
                                    handleFeedbackChange(
                                      item.duration.id,
                                      (current) => ({
                                        ...current,
                                        value: event.target.value,
                                      }),
                                    )
                                  }
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                            </div>
                          )}

                          {weightItems.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {weightItems.map((item) => renderSingleField(item, { compact: true }))}
                            </div>
                          )}

                          {miscItems.map((item) => renderSingleField(item))}

                          {commentItems.map((item) => renderSingleField(item))}
                        </div>
                      );
                    })()}
                </div>

                {feedbackError && (
                  <div className="alert alert-error py-2 text-sm">
                    {feedbackError}
                  </div>
                )}

                {isAthlete && (
                  <div className="mt-auto flex items-center justify-end">
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
