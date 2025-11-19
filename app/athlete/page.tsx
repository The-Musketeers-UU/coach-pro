"use client";

import { useState } from "react";
import { programWeeks, ProgramWeek } from "@/app/data/program-weeks";

export default function AthleteSchedulePage() {
  const [activeWeekId, setActiveWeekId] = useState<ProgramWeek["id"]>(programWeeks[0].id);
  const activeWeek = programWeeks.find((week) => week.id === activeWeekId) ?? programWeeks[0];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Anna's Schedules</h1>
              <p className="text-sm text-base-content/70">Shared by coach Benke.</p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
            </div>
          </div>

          <div className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Vecka</p>
                  <h2 className="text-2xl font-semibold">{activeWeek.label}</h2>
                  <p className="text-sm text-base-content/70">Fokus: {activeWeek.focus}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {activeWeek.days.map((day) => (
                  <article
                    key={day.id}
                    className="flex min-h-[220px] flex-col rounded-2xl border border-base-300 bg-base-300 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral">{day.label}</p>
                        <p className="text-sm text-base-content/70">{day.modules.length} pass</p>
                      </div>
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
                          Inga pass schemalagda.
                        </p>
                      )}
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
