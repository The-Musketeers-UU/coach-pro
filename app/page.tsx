"use client";

import { FormEvent, useState } from "react";

import {
  addModuleToSchedule,
  createTrainingModule,
  type AddModuleToScheduleInput,
  type CreateTrainingModuleInput,
} from "@/lib/supabase/training-modules";

const moduleFocusOptions: CreateTrainingModuleInput["focus"][] = [
  "STRENGTH",
  "CONDITIONING",
  "MOBILITY",
  "MINDSET",
  "RECOVERY",
];

const moduleIntensityOptions: CreateTrainingModuleInput["intensity"][] = [
  "LOW",
  "MODERATE",
  "HIGH",
];

const createDefaultModuleForm = (): CreateTrainingModuleInput => ({
  title: "",
  focus: "STRENGTH",
  intensity: "MODERATE",
  durationMinutes: 30,
  description: "",
  createdById: "",
});

const createDefaultScheduleForm = (): AddModuleToScheduleInput => ({
  scheduleId: "",
  dayOfWeek: "MONDAY",
  moduleId: "",
  notes: "",
  position: 0,
});

export default function CoachDashboard() {
  const [moduleForm, setModuleForm] = useState<CreateTrainingModuleInput>(
    createDefaultModuleForm,
  );
  const [scheduleForm, setScheduleForm] = useState<AddModuleToScheduleInput>(
    createDefaultScheduleForm,
  );
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [moduleResult, setModuleResult] = useState<string | null>(null);
  const [scheduleResult, setScheduleResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateModule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingModule(true);
    setError(null);
    setModuleResult(null);

    try {
      const sanitizedInput: CreateTrainingModuleInput = {
        ...moduleForm,
        createdById: moduleForm.createdById?.trim() || null,
      };
      const createdModule = await createTrainingModule(sanitizedInput);
      setModuleResult(`Created module “${createdModule.title}” with id ${createdModule.id}.`);
      setModuleForm(createDefaultModuleForm());
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleAddToSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingSchedule(true);
    setError(null);
    setScheduleResult(null);

    try {
      const { day, scheduledModule } = await addModuleToSchedule({
        ...scheduleForm,
        position: Number.isFinite(scheduleForm.position)
          ? Number(scheduleForm.position)
          : undefined,
        notes: scheduleForm.notes?.trim() || undefined,
      });

      setScheduleResult(
        `Added module ${scheduledModule.module_id} to ${day.day_of_week} (day ${day.id}) at position ${scheduledModule.position}.`,
      );
      setScheduleForm(createDefaultScheduleForm());
    } catch (supabaseError) {
      setError(supabaseError instanceof Error ? supabaseError.message : String(supabaseError));
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Supabase tooling</p>
          <h1 className="text-3xl font-semibold">Training modules + schedules</h1>
          <p className="text-base text-base-content/70">
            Create new reusable training modules and attach them to Supabase-backed schedules without relying on
            placeholder data.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-4">
              <header className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Modules</p>
                <h2 className="text-xl font-semibold">Create a training module</h2>
                <p className="text-sm text-base-content/70">
                  Save a reusable building block directly to Supabase with focus, intensity, and duration metadata.
                </p>
              </header>

              <form className="space-y-3" onSubmit={handleCreateModule}>
                <label className="form-control">
                  <span className="label-text">Title</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    required
                    value={moduleForm.title}
                    onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Acceleration mechanics"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Focus</span>
                    <select
                      className="select select-bordered"
                      value={moduleForm.focus}
                      onChange={(event) =>
                        setModuleForm((prev) => ({ ...prev, focus: event.target.value as CreateTrainingModuleInput["focus"] }))
                      }
                    >
                      {moduleFocusOptions.map((focus) => (
                        <option key={focus} value={focus}>
                          {focus}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-control">
                    <span className="label-text">Intensity</span>
                    <select
                      className="select select-bordered"
                      value={moduleForm.intensity}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          intensity: event.target.value as CreateTrainingModuleInput["intensity"],
                        }))
                      }
                    >
                      {moduleIntensityOptions.map((intensity) => (
                        <option key={intensity} value={intensity}>
                          {intensity}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Duration (minutes)</span>
                    <input
                      type="number"
                      min={1}
                      className="input input-bordered"
                      value={moduleForm.durationMinutes}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          durationMinutes: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Created by (optional)</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={moduleForm.createdById ?? ""}
                      onChange={(event) =>
                        setModuleForm((prev) => ({
                          ...prev,
                          createdById: event.target.value,
                        }))
                      }
                      placeholder="coach_user_id"
                    />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text">Description</span>
                  <textarea
                    className="textarea textarea-bordered"
                    rows={4}
                    required
                    value={moduleForm.description}
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
                <h2 className="text-xl font-semibold">Attach a module to a schedule</h2>
                <p className="text-sm text-base-content/70">
                  Use the new Supabase REST helpers to connect a module to a weekly schedule and training day.
                </p>
              </header>

              <form className="space-y-3" onSubmit={handleAddToSchedule}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Schedule ID</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={scheduleForm.scheduleId}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({ ...prev, scheduleId: event.target.value }))
                      }
                      placeholder="schedule_uuid"
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Day of week</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      required
                      value={scheduleForm.dayOfWeek}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({ ...prev, dayOfWeek: event.target.value.toUpperCase() }))
                      }
                      placeholder="MONDAY"
                    />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text">Module ID</span>
                  <input
                    type="text"
                    className="input input-bordered"
                    required
                    value={scheduleForm.moduleId}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({ ...prev, moduleId: event.target.value }))
                    }
                    placeholder="module_uuid"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">Position (optional)</span>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={scheduleForm.position ?? 0}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          position: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text">Notes (optional)</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={scheduleForm.notes ?? ""}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Context for this placement"
                    />
                  </label>
                </div>

                <button className="btn btn-secondary w-full" type="submit" disabled={isSubmittingSchedule}>
                  {isSubmittingSchedule ? "Saving to schedule..." : "Add module to schedule"}
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
