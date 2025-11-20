"use client";

import { useState } from "react";
import { programWeeks, ProgramWeek } from "@/app/data/program-weeks";

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
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState("");
  const activeWeek = programWeeks[weekIndex];
  const weekNumber = 33 + weekIndex;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-outline btn-primary btn-xs"
                onClick={() => setWeekIndex((prev) => prev - 1)}
                aria-label="Previous week"
              >
                &lt;
              </button>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral">Vecka {weekNumber}</p>
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={() => setWeekIndex((prev) => prev + 1)}
                aria-label="Next week"
              >
                &gt;
              </button>
            </div>
            <button className="btn btn-outline btn-sm btn-secondary">Edit program</button>
          </div>

          <div className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                {activeWeek ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Vecka {weekNumber}</p>
                    <h3 className="text-2xl font-semibold">{activeWeek.label}</h3>
                    <p className="text-sm text-base-content/70">Focus: {activeWeek.focus}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Vecka {weekNumber}</p>
                    <h3 className="text-2xl font-semibold">No schedule</h3>
                    <p className="text-sm text-base-content/70">Empty week.</p>
                  </div>
                )}
              </div>

              {activeWeek ? (
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
              ) : (
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-100/60 p-6 text-center text-sm text-base-content/70">
                  Empty week.
                </div>
              )}
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
