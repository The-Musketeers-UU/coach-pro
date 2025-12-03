"use client";

import { useState } from "react";

import { ModuleBadges } from "@/components/ModuleBadges";

export type ProgramModule = {
  id?: string;
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

type LocalComment = {
  id: string;
  body: string;
  createdAt: string;
};

type PerformanceEntry = {
  id: string;
  time: string;
  performance: string;
  recordedAt: string;
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
  emptyWeekDescription = "Ingen data for veckan.",
  viewerRole = "coach",
}: WeekScheduleViewProps) {
  const [selectedModule, setSelectedModule] = useState<SelectedModuleState | null>(
    null,
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [commentsByModule, setCommentsByModule] = useState<
    Record<string, LocalComment[]>
  >({});
  const [performanceEntriesByModule, setPerformanceEntriesByModule] = useState<
    Record<string, PerformanceEntry[]>
  >({});
  const [performanceDraft, setPerformanceDraft] = useState({
    time: "",
    performance: "",
  });

  const isCoach = viewerRole === "coach";

  const heading =
    title ??
    (week
      ? week.label || `Vecka ${weekNumber}`
      : emptyWeekTitle || `Vecka ${weekNumber}`);

  const selectedComments = selectedModule
    ? commentsByModule[selectedModule.key] ?? []
    : [];
  const selectedPerformanceEntries = selectedModule
    ? performanceEntriesByModule[selectedModule.key] ?? []
    : [];

  const handleAddComment = () => {
    if (!selectedModule) return;

    const body = commentDraft.trim();
    if (!body) return;

    const newComment: LocalComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      body,
      createdAt: new Date().toISOString(),
    };

    setCommentsByModule((prev) => {
      const existing = prev[selectedModule.key] ?? [];
      return {
        ...prev,
        [selectedModule.key]: [...existing, newComment],
      };
    });

    setCommentDraft("");
  };

  const handleAddPerformanceEntry = () => {
    if (!selectedModule) return;

    const timeValue = performanceDraft.time.trim();
    const performanceValue = performanceDraft.performance.trim();
    if (!timeValue || !performanceValue) return;

    const newEntry: PerformanceEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      time: timeValue,
      performance: performanceValue,
      recordedAt: new Date().toISOString(),
    };

    setPerformanceEntriesByModule((prev) => {
      const existing = prev[selectedModule.key] ?? [];
      return {
        ...prev,
        [selectedModule.key]: [...existing, newEntry],
      };
    });

    setPerformanceDraft({ time: "", performance: "" });
  };

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
                        const moduleKey = module.id ?? `${day.id}-${index}`;
                        setSelectedModule({ module, key: moduleKey });
                        setCommentDraft("");
                        setPerformanceDraft({ time: "", performance: "" });
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
                      selectedModule.module.durationSeconds,
                    ) || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Prestationslogg
                  </p>
                  <p className="text-xs text-base-content/70">
                    {isCoach
                      ? "Lägg till tider och prestationer for detta pass."
                      : "Visar registrerade prestationer från coacher."}
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto">
                {selectedPerformanceEntries.length === 0 ? (
                  <p className="text-xs text-base-content/60">
                    Inga prestationer registrerade än.
                  </p>
                ) : (
                  selectedPerformanceEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-lg border border-base-200 bg-base-100/80 p-2 text-sm"
                    >
                      <p className="text-xs text-base-content/60">
                        {new Date(entry.recordedAt).toLocaleString()}
                      </p>
                      <div className="flex items-center justify-between text-sm font-semibold text-base-content">
                        <span>Tid: {entry.time}</span>
                        <span>Prestation: {entry.performance}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isCoach && (
                <div className="space-y-2 rounded-lg border border-dashed border-base-200 bg-base-100/60 p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="form-control">
                      <span className="label-text text-xs">Tid</span>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        placeholder="00:00"
                        value={performanceDraft.time}
                        onChange={(event) =>
                          setPerformanceDraft((prev) => ({
                            ...prev,
                            time: event.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text text-xs">Prestation</span>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        placeholder="Notering om hur det gick"
                        value={performanceDraft.performance}
                        onChange={(event) =>
                          setPerformanceDraft((prev) => ({
                            ...prev,
                            performance: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddPerformanceEntry}
                      disabled={
                        !performanceDraft.time.trim() ||
                        !performanceDraft.performance.trim()
                      }
                      type="button"
                    >
                      Lägg till registrering
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral">
                    Kommentarer
                  </p>
                  <p className="text-xs text-base-content/70">
                    Testlage: sparas bara lokalt medan sidan ar oppen.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedComments.length === 0 ? (
                  <p className="text-xs text-base-content/60">
                    Inga kommentarer annu.
                  </p>
                ) : (
                  selectedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-base-200 bg-base-100/80 p-2 text-sm"
                    >
                      <p className="text-xs text-base-content/60">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-base-content/90 whitespace-pre-wrap">
                        {comment.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="form-control space-y-2">
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Lamna en kommentar om passet"
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  rows={3}
                />
                <button
                  className="btn btn-primary btn-sm self-end"
                  onClick={handleAddComment}
                  disabled={!commentDraft.trim()}
                >
                  Skicka kommentar
                </button>
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
