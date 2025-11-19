"use client";

import { useMemo, useState } from "react";

type Module = {
  id: string;
  title: string;
  focus: "Strength" | "Conditioning" | "Mobility" | "Mindset" | "Recovery";
  duration: string;
  intensity: "Low" | "Moderate" | "High";
  description: string;
};

type DaySchedule = Record<string, Module[]>;

const modules: Module[] = [
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
  const [schedule, setSchedule] = useState<DaySchedule>(() =>
    days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {} as DaySchedule),
  );

  const filteredModules = useMemo(() => {
    return modules.filter((module) => {
      const matchesSearch = module.title.toLowerCase().includes(search.toLowerCase());
      const matchesFocus = focusFilter === "All" || module.focus === focusFilter;
      return matchesSearch && matchesFocus;
    });
  }, [search, focusFilter]);

  const focusOptions: ("All" | Module["focus"])[] = [
    "All",
    "Strength",
    "Conditioning",
    "Mobility",
    "Mindset",
    "Recovery",
  ];

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-10 lg:py-12">
        <aside className="w-full rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 lg:w-1/3">
          <header className="mb-6 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Module Library</p>
            <h1 className="text-2xl font-semibold text-slate-900">Build from your toolkit</h1>
            <p className="text-sm text-slate-500">
              Search, filter, then drag & drop modules into your weekly schedule.
            </p>
          </header>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Search modules</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
                placeholder="e.g. Threshold, Mobility"
              />
            </label>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Focus area</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {focusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFocusFilter(option)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      option === focusFilter
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reusable blocks</p>
            <div className="mt-2 max-h-[32rem] space-y-3 overflow-y-auto pr-1">
              {filteredModules.map((module) => (
                <article
                  key={module.id}
                  draggable
                  onDragStart={() => setActiveDrag(module)}
                  onDragEnd={() => setActiveDrag(null)}
                  className="cursor-grab rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{module.focus}</p>
                    <span className="text-xs text-slate-400">{module.duration}</span>
                  </div>
                  <h2 className="mt-1 text-base font-semibold text-slate-900">{module.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{module.description}</p>
                  <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Intensity: {module.intensity}
                  </div>
                </article>
              ))}

              {filteredModules.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  No modules match your search. Clear filters to see more.
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="w-full rounded-3xl bg-white p-6 shadow-lg ring-1 ring-slate-100 lg:w-2/3">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Schedule in progress</p>
              <h2 className="text-3xl font-semibold text-slate-900">Camp Momentum · June 3 – 9</h2>
              <p className="text-sm text-slate-500">
                Drag modules into each day. Click a block to remove it from the daily plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{Object.values(schedule).reduce((count, blocks) => count + blocks.length, 0)} modules scheduled</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>{focusFilter === "All" ? "All focuses" : focusFilter}</span>
              </div>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {days.map((day) => (
              <div
                key={day.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(day.id)}
                className="flex min-h-[220px] flex-col rounded-2xl border border-slate-100 bg-slate-50/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{day.label}</p>
                    <p className="text-sm text-slate-400">{schedule[day.id].length} modules</p>
                  </div>
                  <span className="text-xs text-slate-400">Drop here</span>
                </div>

                <div className="mt-3 flex-1 space-y-3">
                  {schedule[day.id].length === 0 && (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/60 p-3 text-center text-xs text-slate-400">
                      Drag a module to begin
                    </div>
                  )}

                  {schedule[day.id].map((module, index) => (
                    <button
                      key={`${module.id}-${index}`}
                      onClick={() => handleRemoveModule(day.id, index)}
                      className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-red-200 hover:bg-red-50"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{module.focus}</span>
                        <span>{module.duration}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{module.title}</p>
                      <p className="text-xs text-slate-500">Tap to remove</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
