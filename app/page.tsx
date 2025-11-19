"use client";

import { FormEvent, useMemo, useState } from "react";

type Module = {
  id: string;
  title: string;
  focus: "Strength" | "Conditioning" | "Mobility" | "Mindset" | "Recovery";
  duration: string;
  intensity: "Low" | "Moderate" | "High";
  description: string;
  feedbackRequest: string;
};

type ScheduledModule = Module & {
  athleteFeedback: string;
};

type ModuleForm = Omit<Module, "id">;

type DaySchedule = Record<string, ScheduledModule[]>;

type TrainingGroup = {
  id: string;
  name: string;
  focus: string;
  location: string;
  weekNumber: number;
  description: string;
  athletes: {
    id: string;
    name: string;
    role: string;
    readiness: number;
    currentProgram: string;
    weekSummary: string;
    linkedWeek?: number;
    linkedFocus?: string;
  }[];
  programTemplates: string[];
};

type WeekWindow = {
  id: "prev" | "current" | "next";
  label: string;
  offset: number;
  readiness: number;
  focus: string;
  highlights: string[];
  days: {
    name: string;
    plan: string;
    feedbackNeed: string;
  }[];
  weekLabel?: string;
};

const initialModules: Module[] = [
  {
    id: "mod-1",
    title: "Explosive Power Circuit",
    focus: "Strength",
    duration: "45 min",
    intensity: "High",
    description: "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output.",
    feedbackRequest: "Bar speed + RPE immediately post circuit",
  },
  {
    id: "mod-2",
    title: "Tempo Endurance Ride",
    focus: "Conditioning",
    duration: "60 min",
    intensity: "Moderate",
    description: "Zone 3 tempo ride with cadence holds for sustainable power.",
    feedbackRequest: "Average heart rate + cadence screenshot",
  },
  {
    id: "mod-3",
    title: "Mobility & Prehab Flow",
    focus: "Mobility",
    duration: "25 min",
    intensity: "Low",
    description: "Thoracic opener, hip cars, and ankle sequencing for joint prep.",
    feedbackRequest: "Note tightest area + pain scale",
  },
  {
    id: "mod-4",
    title: "Race Visualization",
    focus: "Mindset",
    duration: "15 min",
    intensity: "Low",
    description: "Guided visualization script focusing on strategic decision-making.",
    feedbackRequest: "One tactical cue you locked in",
  },
  {
    id: "mod-5",
    title: "Threshold Track Session",
    focus: "Conditioning",
    duration: "50 min",
    intensity: "High",
    description: "5x1k repeats @ 10k pace with 90s recoveries to raise lactate threshold.",
    feedbackRequest: "Split screenshot + final rep feeling",
  },
  {
    id: "mod-6",
    title: "Contrast Recovery",
    focus: "Recovery",
    duration: "30 min",
    intensity: "Low",
    description: "Contrast bath protocol paired with diaphragmatic breathing reset.",
    feedbackRequest: "Water temp + perceived freshness",
  },
  {
    id: "mod-7",
    title: "Strength Foundations",
    focus: "Strength",
    duration: "40 min",
    intensity: "Moderate",
    description: "Tempo squats, pull variations, and single-leg stability primer.",
    feedbackRequest: "Tempo adherence check + single-leg stability notes",
  },
  {
    id: "mod-8",
    title: "Track Strides",
    focus: "Conditioning",
    duration: "20 min",
    intensity: "Moderate",
    description: "8x120m strides with buildups to reinforce running mechanics.",
    feedbackRequest: "Video clip of best stride",
  },
];

const initialTrainingGroups: TrainingGroup[] = [
  {
    id: "grp-1",
    name: "Middle Distance Elite",
    focus: "Sharpening speed + resilience",
    location: "Flagstaff",
    weekNumber: 23,
    description: "Race-week squad combining 800m + 1500m specialists with shared quality sessions.",
    programTemplates: ["Camp Momentum", "Speed Sustain", "Altitude Prep"],
    athletes: [
      {
        id: "ath-1",
        name: "Jordan Vega",
        role: "800m",
        readiness: 94,
        currentProgram: "Week 23: Sharpening",
        weekSummary: "Tue threshold · Thu speed · Sat race day",
      },
      {
        id: "ath-2",
        name: "Leo Brennan",
        role: "400m",
        readiness: 78,
        currentProgram: "Week 23: RPR",
        weekSummary: "High/low setup with double recoveries",
      },
    ],
  },
  {
    id: "grp-2",
    name: "Altitude Prep Collective",
    focus: "Aerobic expansion",
    location: "St. Moritz",
    weekNumber: 27,
    description: "Triathletes + marathoners building long steady sessions before altitude camp.",
    programTemplates: ["Altitude Prep", "Ironman Build"],
    athletes: [
      {
        id: "ath-3",
        name: "Mira Hwang",
        role: "Triathlon",
        readiness: 88,
        currentProgram: "Week 27: Capacity",
        weekSummary: "2x long rides + brick run",
      },
      {
        id: "ath-4",
        name: "Ada Lewis",
        role: "Marathon",
        readiness: 61,
        currentProgram: "Week 27: Progressive",
        weekSummary: "Wave tempos + hills",
      },
    ],
  },
  {
    id: "grp-3",
    name: "Return-to-Play Hub",
    focus: "Strength + mobility rebuild",
    location: "Remote",
    weekNumber: 15,
    description: "Hybrid group balancing gym constraints and gradual loading.",
    programTemplates: ["Return-to-Play", "Prehab Prime"],
    athletes: [
      {
        id: "ath-5",
        name: "Rafa Costa",
        role: "Soccer",
        readiness: 67,
        currentProgram: "Week 15: Bridge",
        weekSummary: "Alter-G runs + tissue work",
      },
    ],
  },
];

const baseWeekWindows: WeekWindow[] = [
  {
    id: "prev",
    label: "Week prior",
    offset: -1,
    readiness: 88,
    focus: "Regeneration + volume",
    highlights: ["Backed off intensity to absorb camp travel", "Athletes delivered full feedback on strain"],
    days: [
      { name: "Mon", plan: "Regeneration pool", feedbackNeed: "HRV + soreness check" },
      { name: "Wed", plan: "Aerobic builder", feedbackNeed: "RPE + cadence" },
      { name: "Fri", plan: "Mobility + tempo", feedbackNeed: "Video of split squats" },
    ],
  },
  {
    id: "current",
    label: "Current week",
    offset: 0,
    readiness: 92,
    focus: "Sharpening",
    highlights: ["Two high-quality sessions", "Reduced volume to stay fresh"],
    days: [
      { name: "Tue", plan: "Threshold track", feedbackNeed: "Splits + RPE" },
      { name: "Thu", plan: "Speed endurance", feedbackNeed: "Video of first 2 reps" },
      { name: "Sat", plan: "Race day warm-up", feedbackNeed: "Post-race recap" },
    ],
  },
  {
    id: "next",
    label: "Next week",
    offset: 1,
    readiness: 90,
    focus: "Taper + feedback loop",
    highlights: ["One touch of intensity", "Double regeneration days"],
    days: [
      { name: "Mon", plan: "Contrast recovery", feedbackNeed: "Freshness rating" },
      { name: "Wed", plan: "Activation lift", feedbackNeed: "Load tolerance" },
      { name: "Fri", plan: "Travel shakeout", feedbackNeed: "Availability window" },
    ],
  },
];

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
  const [focusFilter, setFocusFilter] = useState<string>("All");
  const [activeDrag, setActiveDrag] = useState<Module | null>(null);
  const [moduleLibrary, setModuleLibrary] = useState<Module[]>(initialModules);
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule),
  );
  const [newModule, setNewModule] = useState<ModuleForm>(() => createInitialFormState());
  const [formError, setFormError] = useState<string | null>(null);
  const [isAddModuleExpanded, setIsAddModuleExpanded] = useState(false);
  const [overallFocus, setOverallFocus] = useState("Race-week sharpening");
  const [currentWeek, setCurrentWeek] = useState(23);
  const [activeWeekWindow, setActiveWeekWindow] = useState<WeekWindow["id"]>("current");
  const [trainingGroups, setTrainingGroups] = useState<TrainingGroup[]>(initialTrainingGroups);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialTrainingGroups[0].id);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(initialTrainingGroups[0].athletes[0].id);
  const [linkConfirmation, setLinkConfirmation] = useState<string | null>(null);

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
  const focusValues = focusOptions.filter((option): option is Module["focus"] => option !== "All");

  const handleDrop = (dayId: string) => {
    if (!activeDrag) return;
    const scheduledModule: ScheduledModule = {
      ...activeDrag,
      athleteFeedback: "",
    };
    setSchedule((prev) => ({
      ...prev,
      [dayId]: [...prev[dayId], scheduledModule],
    }));
    setActiveDrag(null);
  };

  const handleRemoveModule = (dayId: string, moduleIndex: number) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, index) => index !== moduleIndex),
    }));
  };

  const handleFeedbackChange = (dayId: string, moduleIndex: number, feedback: string) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId].map((module, index) =>
        index === moduleIndex ? { ...module, athleteFeedback: feedback } : module,
      ),
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

  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleGroupSelectionChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    const group = trainingGroups.find((g) => g.id === groupId);
    setSelectedAthleteId(group?.athletes[0]?.id ?? "");
  };

  const handleAthleteSummaryChange = (groupId: string, athleteId: string, weekSummary: string) => {
    setTrainingGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              athletes: group.athletes.map((athlete) =>
                athlete.id === athleteId ? { ...athlete, weekSummary } : athlete,
              ),
            }
          : group,
      ),
    );
  };

  const handleLinkProgram = () => {
    if (!selectedGroupId || !selectedAthleteId) return;

    setTrainingGroups((prev) =>
      prev.map((group) =>
        group.id === selectedGroupId
          ? {
              ...group,
              weekNumber: currentWeek,
              athletes: group.athletes.map((athlete) =>
                athlete.id === selectedAthleteId
                  ? {
                      ...athlete,
                      currentProgram: `Week ${currentWeek}: ${overallFocus}`,
                      linkedWeek: currentWeek,
                      linkedFocus: overallFocus,
                    }
                  : athlete,
              ),
            }
          : group,
      ),
    );

    const group = trainingGroups.find((g) => g.id === selectedGroupId);
    const athlete = group?.athletes.find((a) => a.id === selectedAthleteId);
    setLinkConfirmation(
      athlete
        ? `${athlete.name}'s plan is now linked to ${group?.name} · Week ${currentWeek}`
        : null,
    );
  };

  const weekWindows = baseWeekWindows.map((window) => ({
    ...window,
    focus: window.id === "current" ? overallFocus : window.focus,
    weekLabel: `Week ${currentWeek + window.offset}`,
  }));

  const activeWindow = weekWindows.find((window) => window.id === activeWeekWindow) ?? weekWindows[1];

  const totalScheduledModules = Object.values(schedule).reduce((count, blocks) => count + blocks.length, 0);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <header className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Module library</p>
                <h1 className="card-title text-3xl">Build from your toolkit</h1>
                <p className="text-sm text-base-content/70">
                  Search, filter, add, then drag modules into the weekly schedule.
                </p>
              </header>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-xs uppercase tracking-wide">Search modules</span>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="e.g. Threshold, Mobility"
                  className="input input-bordered w-full"
                />
              </label>

              <div className="form-control">
                <div className="label">
                  <span className="label-text text-xs uppercase tracking-wide">Focus area</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setFocusFilter(option)}
                      className={`btn btn-xs ${option === focusFilter ? "btn-primary" : "btn-outline"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="card-title text-lg">Add a new module</h2>
                  <p className="text-sm text-base-content/70">Capture on-the-fly blocks that you can immediately schedule.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModuleExpanded((prev) => !prev)}
                  className="btn btn-outline btn-sm"
                  aria-expanded={isAddModuleExpanded}
                >
                  {isAddModuleExpanded ? "Hide form" : "Add module"}
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

                    <label className="form-control">
                      <span className="label-text">Requested feedback</span>
                      <input
                        type="text"
                        className="input input-bordered"
                        placeholder="e.g. Send RPE + video clip"
                        value={newModule.feedbackRequest}
                        onChange={(event) => setNewModule((prev) => ({ ...prev, feedbackRequest: event.target.value }))}
                      />
                    </label>

                    <button type="submit" className="btn btn-primary w-full">
                      Add module to library
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Reusable blocks</p>
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
                      <div className="text-xs text-base-content/60">Feedback: {module.feedbackRequest}</div>
                      <div className="badge badge-primary badge-sm">Intensity · {module.intensity}</div>
                    </div>
                  </article>
                ))}

                {filteredModules.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-base-300 p-6 text-center text-sm text-base-content/60">
                    No modules match your search. Clear filters to see more.
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="w-full space-y-6 lg:w-2/3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body gap-6">
              <header className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Schedule in progress</p>
                    <h2 className="text-3xl font-semibold">Week {currentWeek} · {overallFocus}</h2>
                    <p className="text-sm text-base-content/70">
                      Drag modules into each day. Tap a block to remove it from the plan.
                    </p>
                  </div>
                  <div className="stats stats-vertical shadow lg:stats-horizontal">
                    <div className="stat">
                      <div className="stat-title">Modules scheduled</div>
                      <div className="stat-value text-primary">{totalScheduledModules}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Active filter</div>
                      <div className="stat-value text-secondary text-lg">
                        {focusFilter === "All" ? "All focuses" : focusFilter}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <label className="form-control md:w-1/2">
                    <span className="label-text text-xs uppercase tracking-wide">Overall focus</span>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={overallFocus}
                      onChange={(event) => setOverallFocus(event.target.value)}
                      placeholder="Speed sharpening, Aerobic build..."
                    />
                  </label>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleWeekChange("prev")}>
                      Previous week
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => handleWeekChange("next")}>
                      Next week
                    </button>
                  </div>
                </div>
              </header>

              <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                {days.map((day) => (
                  <div
                    key={day.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(day.id)}
                    className="flex flex-col rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral">{day.label}</p>
                        <p className="text-sm text-base-content/70">{schedule[day.id].length} modules</p>
                      </div>
                      <span className="badge badge-outline badge-sm">Drop here</span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {schedule[day.id].length === 0 && (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                          Drag a module to begin
                        </div>
                      )}

                      {schedule[day.id].map((module, index) => (
                        <article
                          key={`${module.id}-${index}`}
                          className="rounded-xl border border-base-300 bg-base-100 p-3"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs text-base-content/60">
                              <span>{module.focus}</span>
                              <span>{module.duration}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold">{module.title}</p>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => handleRemoveModule(day.id, index)}
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-xs text-base-content/70">Coach feedback request: {module.feedbackRequest}</p>
                            <label className="form-control">
                              <span className="label-text text-xs">Athlete feedback</span>
                              <textarea
                                className="textarea textarea-bordered textarea-xs"
                                placeholder="e.g. RPE 7, felt poppy"
                                value={module.athleteFeedback}
                                onChange={(event) =>
                                  handleFeedbackChange(day.id, index, event.target.value)
                                }
                              />
                            </label>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Weekly review</p>
                  <h3 className="text-2xl font-semibold">Feedback windows</h3>
                  <p className="text-sm text-base-content/70">Quickly move between weeks to review athlete responses.</p>
                </div>
                <div className="join">
                  {weekWindows.map((window) => (
                    <button
                      key={window.id}
                      className={`btn btn-sm join-item ${activeWeekWindow === window.id ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setActiveWeekWindow(window.id)}
                    >
                      {window.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-base-200 bg-base-200/40 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral">{activeWindow.weekLabel}</p>
                    <p className="text-lg font-semibold">Focus: {activeWindow.focus}</p>
                  </div>
                  <div className="badge badge-outline">Readiness avg · {activeWindow.readiness}%</div>
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-base-content/70">
                  {activeWindow.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {activeWindow.days.map((day) => (
                    <article key={`${activeWindow.id}-${day.name}`} className="rounded-xl border border-base-300 bg-base-100 p-3 text-sm">
                      <p className="font-semibold">{day.name}</p>
                      <p className="text-base-content/70">{day.plan}</p>
                      <p className="text-xs text-base-content/60">Feedback: {day.feedbackNeed}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Training groups</p>
                <h3 className="text-2xl font-semibold">Programs + athletes</h3>
                <p className="text-sm text-base-content/70">
                  View, edit, and link programs directly to your active groups.
                </p>
              </div>

              <div className="space-y-4">
                {trainingGroups.map((group) => (
                  <article key={group.id} className="rounded-3xl border border-base-200 bg-base-100 p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral">Week {group.weekNumber}</p>
                        <h4 className="text-xl font-semibold">{group.name}</h4>
                        <p className="text-sm text-base-content/70">{group.description}</p>
                      </div>
                      <div className="text-sm text-base-content/70">
                        <p>Focus: {group.focus}</p>
                        <p>Location: {group.location}</p>
                        <p>Templates: {group.programTemplates.join(", ")}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {group.athletes.map((athlete) => (
                        <details key={athlete.id} className="collapse rounded-2xl border border-base-200 bg-base-200/40">
                          <summary className="collapse-title flex flex-col gap-1 text-sm font-semibold md:flex-row md:items-center md:justify-between">
                            <span>
                              {athlete.name} · {athlete.role}
                            </span>
                            <span className="text-xs text-base-content/60">Readiness {athlete.readiness}%</span>
                          </summary>
                          <div className="collapse-content space-y-3 text-sm">
                            <div className="rounded-2xl bg-base-100 p-3">
                              <p className="font-semibold">Linked program</p>
                              <p>{athlete.currentProgram}</p>
                              {athlete.linkedWeek && (
                                <p className="text-xs text-base-content/60">
                                  Saved from Week {athlete.linkedWeek} · {athlete.linkedFocus}
                                </p>
                              )}
                            </div>
                            <label className="form-control">
                              <span className="label-text text-xs">Weekly summary</span>
                              <textarea
                                className="textarea textarea-bordered"
                                value={athlete.weekSummary}
                                onChange={(event) =>
                                  handleAthleteSummaryChange(group.id, athlete.id, event.target.value)
                                }
                              />
                            </label>
                            <div className="rounded-2xl border border-dashed border-base-300 p-3 text-xs text-base-content/70">
                              <p className="font-semibold">Feedback threads</p>
                              <p>
                                Coach requests the following updates: RPE + media upload after key sessions. Athletes
                                respond directly in this panel once synced.
                              </p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Link programs</p>
                <h3 className="text-xl font-semibold">Attach this builder to a group or athlete</h3>
                <p className="text-sm text-base-content/70">
                  Save the current week as a reusable program and keep assignments clear for your athletes.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="form-control">
                  <span className="label-text">Training group</span>
                  <select
                    className="select select-bordered"
                    value={selectedGroupId}
                    onChange={(event) => handleGroupSelectionChange(event.target.value)}
                  >
                    {trainingGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text">Athlete</span>
                  <select
                    className="select select-bordered"
                    value={selectedAthleteId}
                    onChange={(event) => setSelectedAthleteId(event.target.value)}
                  >
                    {trainingGroups
                      .find((group) => group.id === selectedGroupId)
                      ?.athletes.map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <button className="btn btn-primary" onClick={handleLinkProgram}>
                Link Week {currentWeek} to selection
              </button>

              {linkConfirmation && <div className="alert alert-success text-sm">{linkConfirmation}</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function createInitialFormState(): ModuleForm {
  return {
    title: "",
    focus: "Strength",
    duration: "",
    intensity: "Moderate",
    description: "",
    feedbackRequest: "",
  };
}
