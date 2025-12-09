"use client";

import { useEffect, useMemo, useState } from "react";

import { updateModuleFeedback } from "@/lib/supabase/training-modules";

import { ModuleBadges } from "@/components/ModuleBadges";

export type ProgramModule = {
  id?: string;
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

type SelectedModuleState = {
  module: ProgramModule;
  key: string;
};

type WeekScheduleViewProps = {
  week?: ProgramWeek;
  weekNumber: number;
  title?: string;
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

type FeedbackFormState = Record<FeedbackFieldKey, { active: boolean; value: string }>;

const FEEDBACK_FIELDS: Record<FeedbackFieldKey, { label: string; placeholder: string; type: string; step?: number; min?: number; max?: number }>= {
  distance: {
    label: "Distans",
    placeholder: "Lägg till distans (m)",
    type: "number",
    step: 10,
    min: 0,
  },
  duration: {
    label: "Tid",
    placeholder: "Lägg till tid (min)",
    type: "number",
    step: 5,
    min: 0,
  },
  weight: {
    label: "Vikt",
    placeholder: "Lägg till vikt (kg)",
    type: "number",
    step: 1,
    min: 0,
  },
  comment: {
    label: "Kommentar",
    placeholder: "Svara på frågan eller lämna feedback",
    type: "textarea",
  },
  feeling: {
    label: "Känsla",
    placeholder: "Bedöm känsla (1-10)",
    type: "number",
    step: 1,
    min: 1,
    max: 10,
  },
  sleepHours: {
    label: "Sömn (timmar)",
    placeholder: "Hur mycket sömn?",
    type: "number",
    step: 0.5,
    min: 0,
  },
};

export function WeekScheduleView({
  week,
  weekNumber,
  title,
  emptyWeekTitle = "Inget program",
  emptyWeekDescription = "Ingen data for veckan.",
  viewerRole: _viewerRole,
  athleteId: _athleteId,
  coachId: _coachId,
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] = useState<SelectedModuleState | null>(
    null,
  );
  const [weekState, setWeekState] = useState<ProgramWeek | undefined>(week);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState | null>(null);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  void _viewerRole;
  void _athleteId;
  void _coachId;

  useEffect(() => {
    setWeekState(week);
  }, [week]);

  const feedbackDefaults = useMemo(() => {
    if (!selectedModule) return null;

    const { module } = selectedModule;
    const buildValue = (value: number | string | null | undefined) =>
      value === null || value === undefined ? "" : String(value);

    const isActive = (value: unknown) => value !== undefined;

    return {
      distance: { active: isActive(module.distance), value: buildValue(module.distance) },
      duration: { active: isActive(module.duration), value: buildValue(module.duration) },
      weight: { active: isActive(module.weight), value: buildValue(module.weight) },
      comment: { active: isActive(module.comment), value: buildValue(module.comment) },
      feeling: { active: isActive(module.feeling), value: buildValue(module.feeling) },
      sleepHours: {
        active: isActive(module.sleepHours),
        value: buildValue(module.sleepHours),
      },
    } satisfies FeedbackFormState;
  }, [selectedModule]);

  useEffect(() => {
    if (feedbackDefaults) {
      setFeedbackForm(feedbackDefaults);
    }
  }, [feedbackDefaults]);

  const heading =
    title ??
    (weekState
      ? weekState.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  const handleFeedbackChange = (
    field: FeedbackFieldKey,
    updater: (current: FeedbackFormState[FeedbackFieldKey]) => FeedbackFormState[FeedbackFieldKey],
  ) => {
    setFeedbackForm((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: updater(prev[field]) };
    });
  };

  const formatSavePayload = () => {
    if (!feedbackForm || !selectedModule?.module.id) return null;

    const toNumber = (value: string) => {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return {
      moduleId: selectedModule.module.id,
      distance: feedbackForm.distance.active ? toNumber(feedbackForm.distance.value) : null,
      duration: feedbackForm.duration.active ? toNumber(feedbackForm.duration.value) : null,
      weight: feedbackForm.weight.active ? toNumber(feedbackForm.weight.value) : null,
      comment: feedbackForm.comment.active
        ? feedbackForm.comment.value.trim() || null
        : null,
      feeling: feedbackForm.feeling.active ? toNumber(feedbackForm.feeling.value) : null,
      sleepHours: feedbackForm.sleepHours.active
        ? toNumber(feedbackForm.sleepHours.value)
        : null,
    } as const;
  };

  const handleSaveFeedback = async () => {
    const payload = formatSavePayload();
    if (!payload) return;

    setIsSavingFeedback(true);
    setFeedbackError(null);

    try {
      const updated = await updateModuleFeedback(payload);

      setWeekState((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          days: prev.days.map((day) => ({
            ...day,
            modules: day.modules.map((module) =>
              module.id === updated.id
                ? {
                    ...module,
                    distance: updated.distance,
                    duration: updated.duration,
                    weight: updated.weight,
                    comment: updated.comment,
                    feeling: updated.feeling,
                    sleepHours: updated.sleepHours,
                  }
                : module,
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
                distance: updated.distance,
                duration: updated.duration,
                weight: updated.weight,
                comment: updated.comment,
                feeling: updated.feeling,
                sleepHours: updated.sleepHours,
              },
            }
          : prev,
      );
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSavingFeedback(false);
    }
  };

  return (
    <div className="card bg-base-200 border border-base-300 shadow-md">
      <div className="card-body gap-6">
        <div className="grid grid-cols-3 items-center w-full">
          <div>
            <h2 className="text-xl font-semibold">{heading}</h2>
            {weekState?.focus && (
              <p className="text-sm text-base-content/70">{weekState.focus}</p>
            )}
          </div>
        </div>

        {weekState ? (
          <div className="grid grid-cols-1 gap-1 md:grid-cols-2 xl:grid-cols-7">
            {weekState.days.map((day) => (
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
            <p className="font-semibold text-base-content">{heading}</p>
            <p>{emptyWeekDescription}</p>
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
                x
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
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Feedback
                  </p>
                  {feedbackError && (
                    <span className="text-xs text-error">{feedbackError}</span>
                  )}
                </div>

                <div className="space-y-3">
                  {feedbackForm &&
                    (Object.keys(FEEDBACK_FIELDS) as FeedbackFieldKey[]).map((field) => {
                      const fieldState = feedbackForm[field];
                      const fieldMeta = FEEDBACK_FIELDS[field];

                      return (
                        <div
                          key={field}
                          className="rounded-lg border border-base-200 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={fieldState.active}
                                onChange={(event) =>
                                  handleFeedbackChange(field, (current) => ({
                                    ...current,
                                    active: event.target.checked,
                                    value: event.target.checked ? current.value : "",
                                  }))
                                }
                              />
                              <span className="text-sm font-semibold">
                                {fieldMeta.label}
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
                                  onChange={(event) =>
                                    handleFeedbackChange(field, (current) => ({
                                      ...current,
                                      value: event.target.value,
                                    }))
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
                                  onChange={(event) =>
                                    handleFeedbackChange(field, (current) => ({
                                      ...current,
                                      value: event.target.value,
                                    }))
                                  }
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedModule(null)}
                    type="button"
                  >
                    Stäng
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={handleSaveFeedback}
                    disabled={isSavingFeedback}
                  >
                    {isSavingFeedback ? "Sparar..." : "Spara feedback"}
                  </button>
                </div>
              </div>
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
