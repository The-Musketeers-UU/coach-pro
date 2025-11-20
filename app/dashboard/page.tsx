"use client";

import { useMemo, useState } from "react";
import { programWeeks } from "@/app/data/program-weeks";

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
  const [activeWeekNumber, setActiveWeekNumber] = useState(programWeeks[0].weekNumber);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  const groups = useMemo(() => Array.from(new Set(athletes.map((athlete) => athlete.program))), []);
  const activeWeek = programWeeks.find((week) => week.weekNumber === activeWeekNumber) ?? null;

  const handleWeekChange = (direction: "previous" | "next") => {
    setActiveWeekNumber((prevWeekNumber) =>
      direction === "next" ? prevWeekNumber + 1 : prevWeekNumber - 1,
    );
  };

  const toggleAthleteSelection = (athleteId: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(athleteId) ? prev.filter((id) => id !== athleteId) : [...prev, athleteId],
    );
  };

  const handleAssignToGroup = () => {
    if (!selectedGroup) {
      return;
    }

    setSelectedGroup("");
    setIsAssignModalOpen(false);
  };

  const handleAssignToAthletes = () => {
    setSelectedAthletes([]);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  aria-label="Previous week"
                  onClick={() => handleWeekChange("previous")}
                >
                  &lt;
                </button>
                <span className="text-lg font-semibold">Vecka {activeWeekNumber}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  aria-label="Next week"
                  onClick={() => handleWeekChange("next")}
                >
                  &gt;
                </button>
              </div>

              <button className="btn btn-outline btn-sm btn-secondary">Edit program</button>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral">
                    Vecka {activeWeekNumber}
                  </p>
                  <h3 className="text-2xl font-semibold">{activeWeek?.label ?? "No schedule"}</h3>
                  <p className="text-sm text-base-content/70">Focus: {activeWeek?.focus ?? "Empty"}</p>
                </div>

                <button className="btn btn-primary btn-sm" onClick={() => setIsAssignModalOpen(true)}>
                  Assign schedule
                </button>
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
                          <div
                            key={`${day.id}-${module.title}`}
                            className="rounded-xl border border-base-200 bg-base-100 p-3"
                          >
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
                <div className="rounded-2xl border border-dashed border-base-300 bg-base-300/80 p-6 text-center text-sm text-base-content/70">
                  No schedule for this week. Empty.
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

        <dialog className={`modal ${isAssignModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box max-w-2xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Assign schedule</h3>
                <p className="text-sm text-base-content/70">
                  Share this week&apos;s plan with a full group or select individual athletes.
                </p>
              </div>
              <button className="btn btn-circle btn-ghost btn-sm" onClick={() => setIsAssignModalOpen(false)}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Groups</p>
                    <h4 className="text-lg font-semibold">Assign to group</h4>
                  </div>
                  <span className="badge badge-outline">{groups.length} available</span>
                </header>

                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Select group</span>
                  </div>
                  <select
                    className="select select-bordered"
                    value={selectedGroup}
                    onChange={(event) => setSelectedGroup(event.target.value)}
                  >
                    <option value="" disabled>
                      Choose a group
                    </option>
                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="btn btn-primary w-full" disabled={!selectedGroup} onClick={handleAssignToGroup}>
                  Assign to group
                </button>
              </section>

              <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Individuals</p>
                    <h4 className="text-lg font-semibold">Assign to athletes</h4>
                  </div>
                  <span className="badge badge-outline">{selectedAthletes.length} selected</span>
                </header>

                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {athletes.map((athlete) => (
                    <label
                      key={athlete.id}
                      className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-base-200 bg-base-50 px-3 py-2 text-sm hover:border-base-300"
                    >
                      <div>
                        <p className="font-semibold">{athlete.name}</p>
                        <p className="text-xs text-base-content/60">{athlete.sport}</p>
                      </div>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={selectedAthletes.includes(athlete.id)}
                        onChange={() => toggleAthleteSelection(athlete.id)}
                      />
                    </label>
                  ))}
                </div>

                <button
                  className="btn btn-secondary w-full"
                  disabled={selectedAthletes.length === 0}
                  onClick={handleAssignToAthletes}
                >
                  Assign to selected athletes
                </button>
              </section>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onSubmit={() => setIsAssignModalOpen(false)}>
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
