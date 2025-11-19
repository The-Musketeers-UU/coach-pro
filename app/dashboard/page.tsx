const programs = [
  {
    id: "camp-momentum",
    name: "Camp Momentum",
    window: "June 3 – 9",
    goal: "Race-week sharpening for elite middle distance squad",
    modules: 18,
    readiness: "On track",
  },
  {
    id: "altitude-prep",
    name: "Altitude Prep Block",
    window: "July 14 – Aug 4",
    goal: "Aerobic capacity build before St. Moritz camp",
    modules: 24,
    readiness: "Building",
  },
  {
    id: "return-to-play",
    name: "Return-to-Play Ramp",
    window: "Rolling",
    goal: "Hybrid strength + mobility focus for injured athletes",
    modules: 12,
    readiness: "Monitoring",
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
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Training dashboard</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Programs & Athletes Overview</h1>
              <p className="text-base text-base-content/70">
                Monitor how each build is progressing and which athletes need support today.
              </p>
            </div>
            <div className="stats stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Active programs</div>
                <div className="stat-value text-primary">{programs.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Athletes in block</div>
                <div className="stat-value text-secondary">{athletes.length}</div>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Programs</h2>
              <p className="text-sm text-base-content/70">Snapshot of each build and its intent.</p>
            </div>
            <button className="btn btn-primary btn-sm rounded-full">New program</button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {programs.map((program) => (
              <article key={program.id} className="card border border-base-200 bg-base-100 shadow-sm">
                <div className="card-body space-y-3">
                  <div className="flex items-center justify-between text-sm text-base-content/70">
                    <span className="badge badge-outline">{program.window}</span>
                    <span className="text-primary">{program.readiness}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{program.name}</h3>
                    <p className="text-sm text-base-content/70">{program.goal}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{program.modules} modules</span>
                    <button className="btn btn-ghost btn-xs text-primary">Open build</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Athletes</h2>
            <p className="text-sm text-base-content/70">
              Training group roster with readiness signals from the last 24 hours.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-base-200 bg-base-100">
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

