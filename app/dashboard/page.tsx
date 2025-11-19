import { useState } from "react";

const programWeeks = [
  {
    id: "wk-1",
    label: "Week 1 · June 3 – 9",
    focus: "Race-week sharpening",
    days: [
      {
        id: "mon",
        label: "Monday",
        modules: [
          { title: "Explosive Power Circuit", focus: "Strength", duration: "45 min", intent: "Olympic lifts, sled pushes, and plyometrics to prime neuromuscular output." },
          { title: "Contrast Recovery", focus: "Recovery", duration: "20 min", intent: "Contrast bathing and diaphragmatic reset before evening check-in." },
        ],
      },
      {
        id: "tue",
        label: "Tuesday",
        modules: [
          { title: "Threshold Track Session", focus: "Conditioning", duration: "50 min", intent: "5x1k @ 10k pace · 90s recovery. Close fast on final rep." },
          { title: "Mobility & Prehab Flow", focus: "Mobility", duration: "25 min", intent: "Thoracic opener, hip cars, and ankle sequencing post-track." },
        ],
      },
      {
        id: "wed",
        label: "Wednesday",
        modules: [
          { title: "Tempo Endurance Ride", focus: "Conditioning", duration: "60 min", intent: "Zone 3 holds with cadence ladders. Keep heart rate capped at 165." },
          { title: "Race Visualization", focus: "Mindset", duration: "15 min", intent: "Guided visualization to rehearse positioning on the final lap." },
        ],
      },
      {
        id: "thu",
        label: "Thursday",
        modules: [
          { title: "Strength Foundations", focus: "Strength", duration: "40 min", intent: "Tempo squats, pull variations, and single-leg stability primer." },
          { title: "Track Strides", focus: "Conditioning", duration: "20 min", intent: "8x120m strides with buildups to stay loose." },
        ],
      },
      {
        id: "fri",
        label: "Friday",
        modules: [
          { title: "Mobility & Prehab Flow", focus: "Mobility", duration: "20 min", intent: "Shortened routine focused on calves and ankles." },
          { title: "Pre-Meet Shakeout", focus: "Conditioning", duration: "30 min", intent: "Light jog, dynamic drills, and strides. Stop if hamstring tightness returns." },
        ],
      },
      {
        id: "sat",
        label: "Saturday",
        modules: [
          { title: "Race Day Warm-up", focus: "Conditioning", duration: "35 min", intent: "Standard race warm-up with fast buildups · coach arrives 60 min prior." },
        ],
      },
      {
        id: "sun",
        label: "Sunday",
        modules: [
          { title: "Regeneration Day", focus: "Recovery", duration: "45 min", intent: "Hydrotherapy + walk + journaling. No structured training." },
        ],
      },
    ],
  },
  {
    id: "wk-2",
    label: "Week 2 · June 10 – 16",
    focus: "Return-to-play rebuild",
    days: [
      {
        id: "mon",
        label: "Monday",
        modules: [
          { title: "Isometric Strength Primer", focus: "Strength", duration: "35 min", intent: "Isometric mid-thigh pull and split squat holds to re-engage posterior chain." },
          { title: "Soft Tissue Flush", focus: "Recovery", duration: "20 min", intent: "Bike flush + foam roll to manage soreness after travel." },
        ],
      },
      {
        id: "tue",
        label: "Tuesday",
        modules: [
          { title: "Acceleration Mechanics", focus: "Conditioning", duration: "30 min", intent: "Wall drills and 6x20m accelerations focusing on projection angle." },
          { title: "Hip Stability", focus: "Mobility", duration: "20 min", intent: "Band walks, Copenhagen planks, and single-leg balance to prep for return to sprinting." },
        ],
      },
      {
        id: "wed",
        label: "Wednesday",
        modules: [
          { title: "Tempo Endurance Run", focus: "Conditioning", duration: "45 min", intent: "Zone 2-3 progression run with stride pickups." },
          { title: "Breathwork Reset", focus: "Mindset", duration: "10 min", intent: "Box breathing to downshift after the run." },
        ],
      },
      {
        id: "thu",
        label: "Thursday",
        modules: [
          { title: "Eccentric Hamstring", focus: "Strength", duration: "30 min", intent: "Nordics, RDLs, and hamstring sliders to progress tissue tolerance." },
          { title: "Mobility Circuit", focus: "Mobility", duration: "20 min", intent: "T-spine openers, 90/90 transitions, and ankle mobility." },
        ],
      },
      {
        id: "fri",
        label: "Friday",
        modules: [
          { title: "Acceleration to Flys", focus: "Conditioning", duration: "30 min", intent: "4x30m accelerations into 30m flys, full recovery." },
          { title: "Contrast Water", focus: "Recovery", duration: "20 min", intent: "3x3 contrast + parasympathetic breathing to manage stress." },
        ],
      },
      {
        id: "sat",
        label: "Saturday",
        modules: [
          { title: "Strength & Power", focus: "Strength", duration: "45 min", intent: "Trap bar deadlift, split squat, and med ball rotational throws." },
        ],
      },
      {
        id: "sun",
        label: "Sunday",
        modules: [
          { title: "Regeneration", focus: "Recovery", duration: "40 min", intent: "Long walk, mobility, and journaling on readiness markers." },
        ],
      },
    ],
  },
];

const athletes = [
  {
    id: "ath-1",
    name: "Jordan Vega",
    sport: "800m",
    program: "Camp Momentum",
    readiness: 94,
    status: "Green",
  },
  {
    id: "ath-2",
    name: "Mira Hwang",
    sport: "Triathlon",
    program: "Altitude Prep Block",
    readiness: 88,
    status: "Green",
  },
  {
    id: "ath-3",
    name: "Leo Brennan",
    sport: "400m",
    program: "Camp Momentum",
    readiness: 72,
    status: "Yellow",
  },
  {
    id: "ath-4",
    name: "Rafa Costa",
    sport: "Soccer",
    program: "Return-to-Play Ramp",
    readiness: 65,
    status: "Yellow",
  },
  {
    id: "ath-5",
    name: "Ada Lewis",
    sport: "Marathon",
    program: "Altitude Prep Block",
    readiness: 58,
    status: "Red",
  },
];

export default function TrainingDashboardPage() {
  const totalModules = programWeeks.reduce(
    (count, week) => count + week.days.reduce((weekCount, day) => weekCount + day.modules.length, 0),
    0,
  );

  const [activeWeekId, setActiveWeekId] = useState(programWeeks[0].id);
  const activeWeek = programWeeks.find((week) => week.id === activeWeekId) ?? programWeeks[0];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Training dashboard</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Programs & Athletes Overview</h1>
              <p className="text-base text-base-content/70">
                Monitor how the current build is progressing and which athletes need support today.
              </p>
            </div>
            <div className="stats stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Weeks in block</div>
                <div className="stat-value text-primary">{programWeeks.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Modules scheduled</div>
                <div className="stat-value text-secondary">{totalModules}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Athletes in block</div>
                <div className="stat-value">{athletes.length}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Camp Momentum</h2>
              <p className="text-sm text-base-content/70">June 3 – 16 · Built in the program builder</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {programWeeks.map((week) => (
                <button
                  key={week.id}
                  className={`btn btn-sm ${week.id === activeWeekId ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveWeekId(week.id)}
                >
                  {week.label}
                </button>
              ))}
              <button className="btn btn-outline btn-sm">Edit program</button>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Active week</p>
                  <h3 className="text-2xl font-semibold">{activeWeek.label}</h3>
                  <p className="text-sm text-base-content/70">Focus: {activeWeek.focus}</p>
                </div>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Days</div>
                    <div className="stat-value text-primary">{activeWeek.days.length}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Modules</div>
                    <div className="stat-value text-secondary">
                      {activeWeek.days.reduce((count, day) => count + day.modules.length, 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeWeek.days.map((day) => (
                  <article
                    key={day.id}
                    className="flex min-h-[240px] flex-col rounded-2xl border border-base-300 bg-base-300 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral">{day.label}</p>
                        <p className="text-sm text-base-content/70">{day.modules.length} modules</p>
                      </div>
                      <span className="badge badge-outline badge-sm">Program builder view</span>
                    </div>

                    <div className="mt-3 space-y-3">
                      {day.modules.map((module) => (
                        <div key={`${day.id}-${module.title}`} className="rounded-xl border border-base-200 bg-base-100 p-3">
                          <div className="flex items-center justify-between text-xs text-base-content/60">
                            <span className="badge badge-outline badge-sm">{module.focus}</span>
                            <span>{module.duration}</span>
                          </div>
                          <p className="mt-1 font-semibold">{module.title}</p>
                          <p className="text-sm text-base-content/70">{module.intent}</p>
                        </div>
                      ))}

                      {day.modules.length === 0 && (
                        <p className="rounded-xl border border-dashed border-base-200 bg-base-100/60 p-4 text-center text-xs text-base-content/60">
                          No modules scheduled.
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Athletes</h2>
            <p className="text-sm text-base-content/70">
              Training group roster with readiness signals from the last 24 hours.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-base-300 bg-base-200">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/70">
                  <th>Athlete</th>
                  <th>Sport</th>
                  <th>Program</th>
                  <th className="text-right">Readiness</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <tr key={athlete.id} className="text-sm">
                    <td>
                      <div className="font-semibold">{athlete.name}</div>
                      <div className="text-xs text-base-content/60">#{athlete.id}</div>
                    </td>
                    <td>{athlete.sport}</td>
                    <td>{athlete.program}</td>
                    <td className="text-right font-semibold">{athlete.readiness}%</td>
                    <td>
                      <span
                        className={`badge ${
                          athlete.status === "Green"
                            ? "badge-success"
                            : athlete.status === "Yellow"
                              ? "badge-warning"
                              : "badge-error"
                        } badge-sm`}
                      >
                        {athlete.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

