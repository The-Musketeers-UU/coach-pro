import Link from "next/link";

const weekPlan = [
  {
    id: "mon",
    day: "Monday",
    date: "June 3",
    readiness: 92,
    status: "Green" as const,
    modules: [
      {
        title: "Explosive Power Circuit",
        focus: "Strength",
        duration: "45 min",
        intent: "Olympic lifts + sled pushes to prime race-week neuromuscular output.",
      },
      {
        title: "Contrast Recovery",
        focus: "Recovery",
        duration: "20 min",
        intent: "Contrast bathing and diaphragmatic reset before evening check-in.",
      },
    ],
    note: "Legs felt fresh after travel day. Maintain protein targets.",
  },
  {
    id: "tue",
    day: "Tuesday",
    date: "June 4",
    readiness: 88,
    status: "Green" as const,
    modules: [
      {
        title: "Threshold Track Session",
        focus: "Conditioning",
        duration: "50 min",
        intent: "5x1k @ 10k pace · 90s recovery. Close fast on final rep.",
      },
      {
        title: "Mobility & Prehab Flow",
        focus: "Mobility",
        duration: "25 min",
        intent: "Thoracic opener, hip cars, and ankle sequencing post-track.",
      },
    ],
    note: "Monitor hydration during the hotter afternoon window.",
  },
  {
    id: "wed",
    day: "Wednesday",
    date: "June 5",
    readiness: 81,
    status: "Yellow" as const,
    modules: [
      {
        title: "Tempo Endurance Ride",
        focus: "Conditioning",
        duration: "60 min",
        intent: "Zone 3 holds with cadence ladders. Keep heart rate capped at 165.",
      },
      {
        title: "Race Visualization",
        focus: "Mindset",
        duration: "15 min",
        intent: "Guided visualization to rehearse positioning on the final lap.",
      },
    ],
    note: "Slight fatigue from humidity. Extra electrolytes recommended.",
  },
  {
    id: "thu",
    day: "Thursday",
    date: "June 6",
    readiness: 86,
    status: "Green" as const,
    modules: [
      {
        title: "Strength Foundations",
        focus: "Strength",
        duration: "40 min",
        intent: "Tempo squats, pull variations, and single-leg stability primer.",
      },
      {
        title: "Track Strides",
        focus: "Conditioning",
        duration: "20 min",
        intent: "8x120m strides with buildups to stay loose.",
      },
    ],
    note: "Coach will join for cues on first three strides.",
  },
  {
    id: "fri",
    day: "Friday",
    date: "June 7",
    readiness: 75,
    status: "Yellow" as const,
    modules: [
      {
        title: "Mobility & Prehab Flow",
        focus: "Mobility",
        duration: "20 min",
        intent: "Shortened routine focused on calves and ankles.",
      },
      {
        title: "Pre-Meet Shakeout",
        focus: "Conditioning",
        duration: "30 min",
        intent: "Light jog, dynamic drills, and strides. Stop if hamstring tightness returns.",
      },
    ],
    note: "Report how the hamstring responds after drills.",
  },
  {
    id: "sat",
    day: "Saturday",
    date: "June 8",
    readiness: 95,
    status: "Green" as const,
    modules: [
      {
        title: "Race Day Warm-up",
        focus: "Conditioning",
        duration: "35 min",
        intent: "Standard race warm-up with fast buildups · coach arrives 60 min prior.",
      },
    ],
    note: "Post-race recovery meal delivered to the hotel.",
  },
  {
    id: "sun",
    day: "Sunday",
    date: "June 9",
    readiness: 70,
    status: "Red" as const,
    modules: [
      {
        title: "Regeneration Day",
        focus: "Recovery",
        duration: "45 min",
        intent: "Hydrotherapy + walk + journaling. No structured training.",
      },
    ],
    note: "Full check-in call with coach at 5 p.m.",
  },
];

const focusHighlights = [
  {
    title: "Race readiness",
    detail: "Sharpening phase with two quality sessions (Tue/Thu) and reduced volume late week.",
  },
  {
    title: "Recovery cues",
    detail: "Contrast work and regeneration day emphasize staying on top of nervous system freshness.",
  },
  {
    title: "Communication",
    detail: "Update the team chat after Tuesday threshold + Friday shakeout to log RPE and any issues.",
  },
];

const statusBadge = {
  Green: "badge-success",
  Yellow: "badge-warning",
  Red: "badge-error",
};

export default function AthleteSchedulePage() {
  const totalModules = weekPlan.reduce((count, day) => count + day.modules.length, 0);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <header className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Athlete view</p>
              <h1 className="text-3xl font-semibold">Jordan Vega · Camp Momentum</h1>
              <p className="text-sm text-base-content/70">June 3 – 9 · Race-week sharpening block</p>
            </div>
            <div className="stats shadow">
              <div className="stat">
                <div className="stat-title">Modules this week</div>
                <div className="stat-value text-primary">{totalModules}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Avg readiness</div>
                <div className="stat-value text-secondary">
                  {Math.round(weekPlan.reduce((sum, day) => sum + day.readiness, 0) / weekPlan.length)}%
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-base-content/70">
            Drag-and-drop stays on the coach experience. This view keeps your week clean, structured, and readable on
            any device.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {focusHighlights.map((highlight) => (
            <article key={highlight.title} className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body space-y-2">
                <p className="text-xs uppercase tracking-wide text-neutral">Focus</p>
                <h2 className="text-lg font-semibold">{highlight.title}</h2>
                <p className="text-sm text-base-content/70">{highlight.detail}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Your schedule</h2>
              <p className="text-sm text-base-content/70">Tap a block to expand and see intent + cues.</p>
            </div>
            <Link className="btn btn-ghost btn-sm rounded-full border-base-200" href="/">
              Back to builder
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-7 gap-3">
                {weekPlan.map((day) => (
                  <article key={day.id} className="flex h-full flex-col rounded-3xl border border-base-300 bg-base-200 shadow-sm">
                    <div className="flex items-start justify-between border-b border-base-300 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral">{day.day}</p>
                        <p className="text-sm text-base-content/70">{day.date}</p>
                        <p className="text-xs text-base-content/60">{day.modules.length} modules</p>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        <p>{day.readiness}% ready</p>
                        <span className={`badge ${statusBadge[day.status]} badge-sm`}>{day.status}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-base-300">
                      {day.modules.map((module) => (
                        <div key={`${day.id}-${module.title}`} className="space-y-1 px-4 py-3 text-sm">
                          <div className="flex items-center justify-between gap-2 font-semibold">
                            <span className="leading-tight">{module.title}</span>
                            <span className="badge badge-outline badge-xs">{module.focus}</span>
                          </div>
                          <p className="text-xs text-base-content/70">Duration: {module.duration}</p>
                          <p className="text-xs text-base-content/60">{module.intent}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto border-t border-base-300 bg-base-300/60 px-4 py-3 text-xs text-base-content/80">
                      <p className="font-semibold text-base-content">Coach note</p>
                      <p>{day.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
