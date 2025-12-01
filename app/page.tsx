import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import {
  addModuleToScheduleDay,
  createModule,
  createScheduleWeek,
  getAthletes,
  getCoaches,
  type AddModuleToScheduleDayInput,
  type AthleteRow,
  type CreateModuleInput,
  type CreateScheduleWeekInput,
} from "@/lib/supabase/training-modules";

const createDefaultModuleForm = (ownerId = ""): CreateModuleInput => ({
  ownerId,
  name: "",
  category: "",
  subCategory: "",
  distance: undefined,
  durationMinutes: undefined,
  durationSeconds: undefined,
  weight: undefined,
  description: "",
});

const createDefaultWeekForm = (ownerId = ""): CreateScheduleWeekInput => ({
  ownerId,
  athleteId: "",
  week: 1,
});

const createDefaultScheduleDayForm = (): AddModuleToScheduleDayInput => ({
  moduleId: "",
  weekId: "",
  day: 1,
});

export default function CoachDashboard() {
  const { profile, isLoadingProfile } = useAuth();
  const [moduleForm, setModuleForm] = useState<CreateModuleInput>(
    () => createDefaultModuleForm(profile?.id ?? ""),
  );
  const [weekForm, setWeekForm] = useState<CreateScheduleWeekInput>(
    () => createDefaultWeekForm(profile?.id ?? ""),
  );
  const [scheduleDayForm, setScheduleDayForm] = useState<AddModuleToScheduleDayInput>(
    createDefaultScheduleDayForm,
  );
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [coaches, setCoaches] = useState<AthleteRow[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);
  const [isSubmittingScheduleDay, setIsSubmittingScheduleDay] = useState(false);
  const [moduleResult, setModuleResult] = useState<string | null>(null);
  const [weekResult, setWeekResult] = useState<string | null>(null);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoadingOptions(true);
      setListError(null);
      try {
        const [athleteRows, coachRows] = await Promise.all([
          getAthletes(),
          getCoaches(),
        ]);
        setAthletes(athleteRows);
        setCoaches(coachRows);
      } catch (supabaseError) {
        setListError(
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void fetchPeople();
  }, []);

  useEffect(() => {
    const ownerId = profile?.id ? String(profile.id) : "";

    setModuleForm((prev) => ({ ...prev, ownerId }));
    setWeekForm((prev) => ({ ...prev, ownerId }));
  }, [profile]);

  const handleCreateModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingModule(true);
    setError(null);
    setModuleResult(null);

    try {
      const sanitizedInput: CreateModuleInput = {
        ...moduleForm,
        ownerId:
          typeof moduleForm.ownerId === "string"
            ? moduleForm.ownerId.trim()
            : String(moduleForm.ownerId ?? "").trim(),
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
      setModuleForm(createDefaultModuleForm(profile?.id ?? ""));
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
        ownerId:
          typeof weekForm.ownerId === "string"
            ? weekForm.ownerId.trim()
            : String(weekForm.ownerId ?? "").trim(),
        athleteId: weekForm.athleteId.trim(),
        week: Number(weekForm.week) || 0,
      };
      const createdWeek = await createScheduleWeek(weekInput);
      setWeekResult(
        `Created week ${createdWeek.week} for athlete ${createdWeek.athlete} owned by ${createdWeek.owner} (id ${createdWeek.id}).`,
      );
      setWeekForm(createDefaultWeekForm(profile?.id ?? ""));
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
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Program builder</p>
          <h1 className="text-3xl font-semibold">Create modules + assign schedules</h1>
          <p className="text-base text-base-content/70">
            Build reusable training modules, create weeks, and link modules to specific days using data stored in Supabase.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <section className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-4">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">People</p>
              <h2 className="text-xl font-semibold">Coach + athlete IDs</h2>
              <p className="text-sm text-base-content/70">
                Use these IDs when filling out the forms below to assign ownership and schedules.
              </p>
            </header>

            {listError && <div className="alert alert-error">{listError}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Coaches</p>
                  {isLoadingOptions && (
                    <span className="loading loading-spinner loading-xs" aria-label="Loading coaches" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {coaches.length ? (
                    coaches.map((coach) => (
                      <span key={coach.id} className="badge badge-outline" title={coach.email}>
                        {coach.name} · {coach.id}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-base-content/70">No coaches found yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">Athletes</p>
                  {isLoadingOptions && (
                    <span className="loading loading-spinner loading-xs" aria-label="Loading athletes" />
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {athletes.length ? (
                    athletes.map((athlete) => (
                      <span key={athlete.id} className="badge badge-outline" title={athlete.email}>
                        {athlete.name} · {athlete.id}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-base-content/70">No athletes found yet.</p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-base-content/60">
              Tip: start with the login page to seed coaches and athletes, then paste their IDs into the builder.
            </p>
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
                      readOnly
                      placeholder={
                        isLoadingProfile
                          ? "Loading your user id..."
                          : "Sign in to load your user id"
                      }
                    />
                    <span className="label-text-alt text-xs text-base-content/70">
                      Automatically set to the signed-in coach.
                    </span>
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

                <button
                  className="btn btn-primary w-full"
                  type="submit"
                  disabled={isSubmittingModule || !moduleForm.ownerId}
                >
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
                      readOnly
                      placeholder={
                        isLoadingProfile
                          ? "Loading your user id..."
                          : "Sign in to load your user id"
                      }
                    />
                    <span className="label-text-alt text-xs text-base-content/70">
                      Filled with the logged-in coach ID.
                    </span>
                  </label>

                  <label className="form-control">
                    <span className="label-text">Athlete ID</span>
                    <select
                      className="select select-bordered"
                      required
                      value={weekForm.athleteId}
                      onChange={(event) =>
                        setWeekForm((prev) => ({ ...prev, athleteId: event.target.value }))
                      }
                      disabled={isLoadingOptions || athletes.length === 0}
                    >
                      <option value="" disabled>
                        {isLoadingOptions ? "Loading athletes..." : "Select an athlete"}
                      </option>
                      {athletes.map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.name} ({athlete.email})
                        </option>
                      ))}
                    </select>
                    <span className="label-text-alt text-xs text-base-content/70">
                      Choose from the existing athletes list.
                    </span>
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

                <button
                  className="btn btn-secondary w-full"
                  type="submit"
                  disabled={isSubmittingWeek || !weekForm.ownerId || !weekForm.athleteId}
                >
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

        <datalist id="coach-options">
          {coaches.map((coach) => (
            <option key={coach.id} value={coach.id}>
              {coach.name} ({coach.email})
            </option>
          ))}
        </datalist>

        <datalist id="athlete-options">
          {athletes.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name} ({athlete.email})
            </option>
          ))}
        </datalist>
      </div>
    </div>
  );
}
