"use client";

import { FormEvent, useMemo, useState } from "react";

type Module = {
  id: string;
  title: string;
  focus: "Strength" | "Conditioning" | "Mobility" | "Mindset" | "Recovery";
  duration: string;
  intensity: "Low" | "Moderate" | "High";
  description: string;
};

type DaySchedule = Record<string, Module[]>;

type ModuleForm = Omit<Module, "id">;

const initialModules: Module[] = [
  {
    id: "mod-1",
    title: "Explosive Power Circuit",
    focus: "Strength",
    duration: "45 min",
    intensity: "High",
    description: "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output.",
  },
  {
    id: "mod-2",
    title: "Tempo Endurance Ride",
    focus: "Conditioning",
    duration: "60 min",
    intensity: "Moderate",
    description: "Zone 3 tempo ride with cadence holds for sustainable power.",
  },
  {
    id: "mod-3",
    title: "Mobility & Prehab Flow",
    focus: "Mobility",
    duration: "25 min",
    intensity: "Low",
    description: "Thoracic opener, hip cars, and ankle sequencing for joint prep.",
  },
  {
    id: "mod-4",
    title: "Race Visualization",
    focus: "Mindset",
    duration: "15 min",
    intensity: "Low",
    description: "Guided visualization script focusing on strategic decision-making.",
  },
  {
    id: "mod-5",
    title: "Threshold Track Session",
    focus: "Conditioning",
    duration: "50 min",
    intensity: "High",
    description: "5x1k repeats @ 10k pace with 90s recoveries to raise lactate threshold.",
  },
  {
    id: "mod-6",
    title: "Contrast Recovery",
    focus: "Recovery",
    duration: "30 min",
    intensity: "Low",
    description: "Contrast bath protocol paired with diaphragmatic breathing reset.",
  },
  {
    id: "mod-7",
    title: "Strength Foundations",
    focus: "Strength",
    duration: "40 min",
    intensity: "Moderate",
    description: "Tempo squats, pull variations, and single-leg stability primer.",
  },
  {
    id: "mod-8",
    title: "Track Strides",
    focus: "Conditioning",
    duration: "20 min",
    intensity: "Moderate",
    description: "8x120m strides with buildups to reinforce running mechanics.",
  },
];

const createInitialFormState = (): ModuleForm => ({
  title: "",
  focus: "Strength",
  duration: "",
  intensity: "Moderate",
  description: "",
});

const days = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

export default function CoachDashboard() {
  const [search, setSearch] = useState("");
  const focusFilter = "All";
  const [activeDrag, setActiveDrag] = useState<Module | null>(null);
  const [moduleLibrary, setModuleLibrary] = useState<Module[]>(initialModules);
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule),
  );
  const [newModule, setNewModule] = useState<ModuleForm>(() => createInitialFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [isAddModuleExpanded, setIsAddModuleExpanded] = useState(false);

  const filteredModules = useMemo(() => {
    return moduleLibrary.filter((module) => {
      const matchesSearch = module.title.toLowerCase().includes(search.toLowerCase());
      const matchesFocus = focusFilter === "All" || module.focus === focusFilter;
      return matchesSearch && matchesFocus;
    });
  }, [moduleLibrary, search, focusFilter]);

  const focusOptions: ("All" | Module["focus"])[] = [
    "All",
    "Strength",
    "Conditioning",
    "Mobility",
    "Mindset",
    "Recovery",
  ];
  const focusValues = focusOptions.filter(
    (option): option is Module["focus"] => option !== "All",
  );

  const handleDrop = (dayId: string) => {
    if (!activeDrag) return;
    setSchedule((prev) => ({
      ...prev,
      [dayId]: [...prev[dayId], activeDrag],
    }));
    setActiveDrag(null);
  };

  const handleRemoveModule = (dayId: string, moduleIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, index) => index !== moduleIndex),
    }));
  };

  const handleAddModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newModule.title.trim() || !newModule.duration.trim() || !newModule.description.trim()) {
      setFormError("Title, duration, and description are required.");
      return;
    }

    const moduleToAdd: Module = {
      id: `mod-${Date.now()}`,
      ...newModule,
    };

    setModuleLibrary((prev) => [moduleToAdd, ...prev]);
    setNewModule(createInitialFormState());
    setFormError(null);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="card bg-base-200 shadow-md border border-base-300">
            <div className="card-body space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="card-title text-lg">Create a new block</h2>
                  <p className="text-sm text-base-content/70">
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModuleExpanded((prev) => !prev)}
                  className="btn btn-secondary btn-outline btn-sm"
                  aria-expanded={isAddModuleExpanded}
                >
                  {isAddModuleExpanded ? "Hide form" : "Add block"}
                </button>
              </div>

              {isAddModuleExpanded && (
                <>
                  {formError && <div className="alert alert-error text-sm">{formError}</div>}

                  <form className="space-y-3" onSubmit={handleAddModule}>
                    <label className="form-control">
                      <span className="label-text">Title</span>
                      <input
                        type="text"
                        value={newModule.title}
                        onChange={(event) => setNewModule((prev) => ({ ...prev, title: event.target.value }))}
                        className="input input-bordered"
                        placeholder="Explosive Acceleration"
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="form-control">
                        <span className="label-text">Focus</span>
                        <select
                          className="select select-bordered"
                          value={newModule.focus}
                          onChange={(event) =>
                            setNewModule((prev) => ({ ...prev, focus: event.target.value as Module["focus"] }))
                          }
                        >
                          {focusValues.map((focus) => (
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
                          value={newModule.intensity}
                          onChange={(event) =>
                            setNewModule((prev) => ({ ...prev, intensity: event.target.value as Module["intensity"] }))
                          }
                        >
                          {["Low", "Moderate", "High"].map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="form-control">
                      <span className="label-text">Duration</span>
                      <input
                        type="text"
                        className="input input-bordered"
                        placeholder="45 min"
                        value={newModule.duration}
                        onChange={(event) => setNewModule((prev) => ({ ...prev, duration: event.target.value }))}
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text">Description</span>
                      <textarea
                        className="textarea textarea-bordered"
                        rows={3}
                        placeholder="What's the intent?"
                        value={newModule.description}
                        onChange={(event) => setNewModule((prev) => ({ ...prev, description: event.target.value }))}
                      />
                    </label>

                    <button type="submit" className="btn btn-secondary w-full">
                      Add block to library
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-md">
            <div className="card-body">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Reusable blocks</p>
                <label className="input input-bordered input-sm flex items-center gap-2 sm:max-w-xs">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search blocks"
                    className="grow"
                  />
                </label>
              </div>
              <div className="mt-3 max-h-[30rem] space-y-3 overflow-y-auto pr-1">
                {filteredModules.map((module) => (
                  <article
                    key={module.id}
                    draggable
                    onDragStart={() => setActiveDrag(module)}
                    onDragEnd={() => setActiveDrag(null)}
                    className="card cursor-grab border border-base-200 bg-base-100 transition hover:border-primary"
                  >
                    <div className="card-body space-y-2 p-4">
                      <div className="flex items-center justify-between text-xs text-base-content/60">
                        <span className="badge badge-outline badge-sm">{module.focus}</span>
                        <span>{module.duration}</span>
                      </div>
                      <h2 className="font-semibold">{module.title}</h2>
                      <p className="text-sm text-base-content/70">{module.description}</p>
                      <div className="badge badge-primary badge-sm">Intensity · {module.intensity}</div>
                    </div>
                  </article>
                ))}

                {filteredModules.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-base-200 p-6 text-center text-sm text-base-content/60">
                    No modules match your search. Clear filters to see more.
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full space-y-6 lg:w-2/3">
          <div className="card bg-base-200 border border-base-300 shadow-md">
            <div className="card-body gap-6">
              <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Schedule in progress</p>
                  <h2 className="text-3xl font-semibold">Camp Momentum · Week 43</h2>
                </div>
              </header>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {days.map((day) => (
                  <div
                    key={day.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(day.id)}
                    className="flex min-h-[220px] flex-col rounded-2xl border border-dashed border-base-200 bg-base-300 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral">{day.label}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex-1 space-y-3">
                      {schedule[day.id].length === 0 && (
                        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                          Drag a module to begin
                        </div>
                      )}

                      {schedule[day.id].map((module, index) => (
                        <div
                          key={`${module.id}-${index}`}
                          className="w-full rounded-xl border border-base-200 bg-base-100 p-3 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs text-base-content/60">
                              <div className="flex items-center gap-2">
                                <span>{module.focus}</span>
                                <span className="text-base-content/50">·</span>
                                <span>{module.duration}</span>
                              </div>
                              <p className="mt-1 font-semibold text-base-content">{module.title}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(day.id, index)}
                              className="btn btn-ghost btn-xs text-error"
                              aria-label={`Delete ${module.title}`}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
