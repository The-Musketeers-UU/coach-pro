"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  addModuleToScheduleDay,
  createModule,
  createScheduleWeek,
  type AddModuleToScheduleDayInput,
  type AthleteRow,
  type CreateModuleInput,
  type CreateScheduleWeekInput,
  getAthletes,
  getScheduleWeeksByAthlete,
  type ScheduleWeekRow,
} from "@/lib/supabase/training-modules";

const createDefaultModuleForm = (): CreateModuleInput => ({
  ownerId: "",
  name: "",
  category: "",
  subCategory: "",
  distance: undefined,
  durationMinutes: undefined,
  durationSeconds: undefined,
  weight: undefined,
  description: "",
});

const createDefaultWeekForm = (): CreateScheduleWeekInput => ({
  ownerId: "",
  athleteId: "",
  week: 1,
});

const createDefaultScheduleDayForm = (): AddModuleToScheduleDayInput => ({
  moduleId: "",
  weekId: "",
  day: 1,
});

export default function CoachDashboard() {
  const [moduleForm, setModuleForm] = useState<CreateModuleInput>(
    createDefaultModuleForm,
  );
  const [weekForm, setWeekForm] = useState<CreateScheduleWeekInput>(createDefaultWeekForm);
  const [scheduleDayForm, setScheduleDayForm] = useState<AddModuleToScheduleDayInput>(
    createDefaultScheduleDayForm,
  );
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [athleteSchedules, setAthleteSchedules] = useState<ScheduleWeekRow[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);
  const [isSubmittingScheduleDay, setIsSubmittingScheduleDay] = useState(false);
  const [moduleResult, setModuleResult] = useState<string | null>(null);
  const [weekResult, setWeekResult] = useState<string | null>(null);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoadingAthletes(true);
      setListError(null);
      try {
        const athleteRows = await getAthletes();
        setAthletes(athleteRows);
      } catch (supabaseError) {
        setListError(
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
        );
      } finally {
        setIsLoadingAthletes(false);
      }
    };

    void fetchAthletes();
  }, []);

  const handleSelectAthlete = async (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsLoadingSchedules(true);
    setListError(null);

    try {
      const weeks = await getScheduleWeeksByAthlete(athleteId);
      setAthleteSchedules(weeks);
    } catch (supabaseError) {
      setListError(
        supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
      );
      setAthleteSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const handleCreateModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingModule(true);
    setError(null);
    setModuleResult(null);

    try {
      const sanitizedInput: CreateModuleInput = {
        ...moduleForm,
        ownerId: moduleForm.ownerId.trim(),
        name: moduleForm.name.trim(),
        category: moduleForm.category.trim(),
        subCategory: moduleForm.subCategory?.trim() || undefined,
        description: moduleForm.description?.trim() || undefined,
        distance: Number.isFinite(moduleForm.distance) ? Number(moduleForm.distance) : undefined,
        durationMinutes: Number.isFinite(moduleForm.durationMinutes)
          ? Number(moduleForm.durationMinutes)
          : undefined,
        durationSeconds: Number.isFinite(moduleForm.durationSeconds)
          ? Number(moduleForm.durationSeconds)
          : undefined,
        weight: Number.isFinite(moduleForm.weight) ? Number(moduleForm.weight) : undefined,
      };
      const createdModule = await createModule(sanitizedInput);
      setModuleResult(`Created module “${createdModule.name}” with id ${createdModule.id}.`);
      setModuleForm(createDefaultModuleForm());
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleCreateWeek = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingWeek(true);
    setError(null);
    setWeekResult(null);

    try {
      const weekInput: CreateScheduleWeekInput = {
        ownerId: weekForm.ownerId.trim(),
        athleteId: weekForm.athleteId.trim(),
        week: Number(weekForm.week) || 0,
      };
      const createdWeek = await createScheduleWeek(weekInput);
      setWeekResult(
        `Created week ${createdWeek.week} for athlete ${createdWeek.athlete} owned by ${createdWeek.owner} (id ${createdWeek.id}).`,
      );
      setWeekForm(createDefaultWeekForm());
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmittingWeek(false);
    }
  };

  const handleAddToScheduleDay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingScheduleDay(true);
    setError(null);
    setScheduleResult(null);

    try {
      const { day, link } = await addModuleToScheduleDay({
        ...scheduleDayForm,
        day: Number.isFinite(scheduleDayForm.day) ? Number(scheduleDayForm.day) : 0,
      });

      setScheduleResult(
        `Linked module ${link.A} to day ${day.day} in week ${day.weekId ?? "(unassigned)"}.`,
      );
      setScheduleDayForm(createDefaultScheduleDayForm());
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmittingScheduleDay(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Supabase tooling</p>
          <h1 className="text-3xl font-semibold">Training modules + schedules</h1>
          <p className="text-base text-base-content/70">
            Create reusable training modules and attach them to schedule days that match the Prisma schema in
            <code className="mx-1 font-mono text-sm">prisma/schema.prisma</code>.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <section className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Athletes</p>
              <h2 className="text-xl font-semibold">Browse athletes + schedules</h2>
              <p className="text-sm text-base-content/70">
                Select an athlete to load all schedule weeks attached to them.
              </p>
            </header>

            {listError && <div className="alert alert-error">{listError}</div>}

            <div className="flex flex-wrap gap-3">
              {isLoadingAthletes ? (
                <span className="loading loading-spinner" aria-label="Loading athletes" />
              ) : athletes.length ? (
                athletes.map((athlete) => (
                  <button
                    key={athlete.id}
                    type="button"
                    className={`btn ${
                      athlete.id === selectedAthleteId ? "btn-primary" : "btn-outline"
                    }`}
                    onClick={() => handleSelectAthlete(athlete.id)}
                  >
                    <span className="font-semibold">{athlete.name}</span>
                    <span className="text-xs font-normal text-base-content/80">{athlete.email}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-base-content/70">No athletes found.</p>
              )}
            </div>

            {selectedAthleteId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Schedule weeks</h3>
                  {isLoadingSchedules && (
                    <span className="loading loading-spinner" aria-label="Loading schedules" />
                  )}
                </div>

                {athleteSchedules.length ? (
                  <ul className="space-y-2">
                    {athleteSchedules.map((week) => (
                      <li
                        key={week.id}
                        className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-4 py-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">Week {week.week}</p>
                          <p className="text-xs text-base-content/70">Schedule ID: {week.id}</p>
                        </div>
                        <span className="badge badge-neutral">Coach: {week.owner}</span>
                      </li>
                    ))}
                  </ul>
                ) : isLoadingSchedules ? null : (
                  <p className="text-sm text-base-content/70">No schedules for this athlete yet.</p>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Modules</p>
                <h2 className="text-xl font-semibold">Create a module</h2>
                <p className="text-sm text-base-content/70">Save a reusable block tied to a specific coach/owner.</p>
              </header>

              <form className="space-y-3" onSubmit={handleCreateModule}>
                <label className="form-control">
                  <span className="label-text">Name</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    required
                    value={moduleForm.name}
                    onChange={(event) => setModuleForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Acceleration mechanics"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Category</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={moduleForm.category}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          category: event.target.value,
                        }))
                      }
                      placeholder="Conditioning"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Sub-category (optional)</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={moduleForm.subCategory ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          subCategory: event.target.value,
                        }))
                      }
                      placeholder="Tempo work"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Distance (meters)</span>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={moduleForm.distance ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          distance: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Weight (kg)</span>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={moduleForm.weight ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          weight: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label className="form-control">
                    <span className="label-text">Duration (minutes)</span>
                    <input
                      type="number"
                      min={0}
                      className="input input-bordered"
                      value={moduleForm.durationMinutes ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          durationMinutes: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Duration (seconds)</span>
                    <input
                      type="number"
                      min={0}
                      className="input input-bordered"
                      value={moduleForm.durationSeconds ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          durationSeconds: event.target.value ? Number(event.target.value) : undefined,
                        }))
                      }
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Owner ID</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={moduleForm.ownerId}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          ownerId: event.target.value,
                        }))
                      }
                      placeholder="coach id"
                    />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text">Description</span>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={4}
                    value={moduleForm.description ?? ""}
                    onChange={(event) =>
                      setModuleForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                    placeholder="Intent, key movements, constraints..."
                  />
                </label>

                <button className="btn btn-primary w-full" type="submit" disabled={isSubmittingModule}>
                  {isSubmittingModule ? "Saving module..." : "Save module to Supabase"}
                </button>
              </form>

              {moduleResult && <div className="alert alert-success text-sm">{moduleResult}</div>}
            </div>
          </section>

          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Schedules</p>
                <h2 className="text-xl font-semibold">Create a schedule week</h2>
                <p className="text-sm text-base-content/70">Add a week for an athlete owned by a coach.</p>
              </header>

              <form className="space-y-3" onSubmit={handleCreateWeek}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Owner ID</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={weekForm.ownerId}
                      onChange={(event) =>
                        setWeekForm((prev) => ({ ...prev, ownerId: event.target.value }))
                      }
                      placeholder="coach id"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Athlete ID</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={weekForm.athleteId}
                      onChange={(event) =>
                        setWeekForm((prev) => ({ ...prev, athleteId: event.target.value }))
                      }
                      placeholder="athlete id"
                    />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text">Week number</span>
                  <input
                    type="number"
                    className="input input-bordered"
                    required
                    min={1}
                    value={weekForm.week}
                    onChange={(event) =>
                      setWeekForm((prev) => ({ ...prev, week: Number(event.target.value) || 1 }))
                    }
                    placeholder="1"
                  />
                </label>

                <button className="btn btn-secondary w-full" type="submit" disabled={isSubmittingWeek}>
                  {isSubmittingWeek ? "Saving week..." : "Save schedule week"}
                </button>
              </form>

              {weekResult && <div className="alert alert-success text-sm">{weekResult}</div>}
            </div>
          </section>

          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Schedule days</p>
                <h2 className="text-xl font-semibold">Attach a module to a day</h2>
                <p className="text-sm text-base-content/70">Create or reuse a day in a week and link a module.</p>
              </header>

              <form className="space-y-3" onSubmit={handleAddToScheduleDay}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Week ID</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={scheduleDayForm.weekId}
                      onChange={(event) =>
                        setScheduleDayForm((prev) => ({ ...prev, weekId: event.target.value }))
                      }
                      placeholder="scheduleWeek id"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Day (1-7)</span>
                    <input
                      type="number"
                      className="input input-bordered"
                      required
                      min={1}
                      max={7}
                      value={scheduleDayForm.day}
                      onChange={(event) =>
                        setScheduleDayForm((prev) => ({ ...prev, day: Number(event.target.value) || 1 }))
                      }
                      placeholder="1"
                    />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text">Module ID</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    required
                    value={scheduleDayForm.moduleId}
                    onChange={(event) =>
                      setScheduleDayForm((prev) => ({ ...prev, moduleId: event.target.value }))
                    }
                    placeholder="module id"
                  />
                </label>

                <button className="btn btn-secondary w-full" type="submit" disabled={isSubmittingScheduleDay}>
                  {isSubmittingScheduleDay ? "Saving to day..." : "Add module to schedule day"}
                </button>
              </form>

              {scheduleResult && <div className="alert alert-success text-sm">{scheduleResult}</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
