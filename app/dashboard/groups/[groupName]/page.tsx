"use client";

import Link from "next/link";
import { useMemo, useState, use } from "react";
import { athleteRoster } from "@/app/data/athletes";
import type { Athlete } from "@/app/data/athletes";
import { programWeeks } from "@/app/data/program-weeks";

const fallbackGroupAthletes: Athlete[] = [
  {
    id: "fallback-g1-1",
    name: "Tova Lindgren",
    sport: "800m",
    program: "Race Readiness",
    readiness: 92,
    status: "Green",
    group: "Group 1",
  },
  {
    id: "fallback-g1-2",
    name: "Milo Ekström",
    sport: "400m",
    program: "Speed Development",
    readiness: 78,
    status: "Yellow",
    group: "Group 1",
  },
  {
    id: "fallback-g2-1",
    name: "Signe Holm",
    sport: "Triathlon",
    program: "Altitude Prep Block",
    readiness: 85,
    status: "Green",
    group: "Group 2",
  },
  {
    id: "fallback-g2-2",
    name: "Elliot Berg",
    sport: "Cycling",
    program: "Stage Race Prep",
    readiness: 74,
    status: "Yellow",
    group: "Group 2",
  },
  {
    id: "fallback-g3-1",
    name: "Liv Sandberg",
    sport: "Swimming",
    program: "Speed & Turns",
    readiness: 69,
    status: "Green",
    group: "Group 3",
  },
  {
    id: "fallback-g3-2",
    name: "Aron Dahl",
    sport: "CrossFit",
    program: "Strength Base",
    readiness: 71,
    status: "Green",
    group: "Group 3",
  },
];

const normalizeGroupName = (value: string) => value.trim().toLowerCase();

export default function GroupDashboardPage({
  params,
}: {
  params: Promise<{ groupName: string }>;
}) {
  const [weekIndex, setWeekIndex] = useState(0);
  const activeWeek = programWeeks[weekIndex];
  const weekNumber = 33 + weekIndex;

  const { groupName } = use(params);
  const decodedGroupName = useMemo(() => decodeURIComponent(groupName), [groupName]);
  const normalizedGroupName = useMemo(
    () => normalizeGroupName(decodedGroupName),
    [decodedGroupName],
  );
  const rosterMatches = athleteRoster.filter(
    (athlete) => normalizeGroupName(athlete.group) === normalizedGroupName,
  );
  const fallbackMatches = fallbackGroupAthletes.filter(
    (athlete) => normalizeGroupName(athlete.group) === normalizedGroupName,
  );
  const groupAthletes = rosterMatches.length > 0 ? rosterMatches : fallbackMatches;
  const displayGroupName =
    rosterMatches[0]?.group ?? fallbackMatches[0]?.group ?? decodedGroupName;
  const allGroups = useMemo(() => {
    const groups = new Set(
      [...athleteRoster, ...fallbackGroupAthletes].map((athlete) => athlete.group),
    );
    groups.add(decodedGroupName);
    return Array.from(groups);
  }, [decodedGroupName]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Coaching group</p>
            <h1 className="text-3xl font-semibold">{displayGroupName}</h1>
            <p className="text-sm text-base-content/70">Athletes and shared plan for this group.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allGroups.map((groupName) => {
              const isCurrentGroup = normalizeGroupName(groupName) === normalizedGroupName;
              return (
                <Link
                  key={groupName}
                  href={`/dashboard/groups/${encodeURIComponent(groupName)}`}
                  className={`btn btn-sm rounded-full px-4 ${
                    isCurrentGroup ? "btn-primary" : "btn-outline btn-primary"
                  }`}
                >
                  {groupName}
                </Link>
              );
            })}
          </div>
        </header>

        <section className="space-y-4">
          <div className="rounded-2xl border border-base-300 bg-base-200 p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Athletes</h2>
            {groupAthletes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {groupAthletes.map((athlete) => (
                  <li key={athlete.id} className="rounded-xl bg-base-100 px-3 py-2">
                    <Link
                      href={`/dashboard/athletes/${athlete.id}`}
                      className="link link-hover font-semibold"
                    >
                      {athlete.name}
                    </Link>
                    <p className="text-xs text-base-content/70">
                      {athlete.sport} · {athlete.program}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-base-content/70">No athletes in this group yet.</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Programs shared with the whole group</h2>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-outline btn-xs btn-primary"
                  onClick={() => setWeekIndex((prev) => prev - 1)}
                  aria-label="Previous week"
                >
                  &lt;
                </button>
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral">Week {weekNumber}</p>
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
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Week {weekNumber}</p>
                      <h3 className="text-2xl font-semibold">{activeWeek.label}</h3>
                      <p className="text-sm text-base-content/70">Focus: {activeWeek.focus}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Week {weekNumber}</p>
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
          </div>
        </section>
      </div>
    </div>
  );
}
