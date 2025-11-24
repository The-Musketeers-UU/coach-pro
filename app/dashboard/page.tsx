"use client";

import { useState } from "react";
import { programWeeks } from "@/app/data/program-weeks";
import { WeekScheduleView } from "@/components/WeekScheduleView";

export default function AthleteSchedulePage() {
  const [weekIndex, setWeekIndex] = useState(0);
  const activeWeek = programWeeks[weekIndex];
  const weekNumber = 33 + weekIndex;

  const goToPreviousWeek = () =>
    setWeekIndex((prev) => Math.max(0, prev - 1));

  const goToNextWeek = () =>
    setWeekIndex((prev) => Math.min(programWeeks.length - 1, prev + 1));

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-full space-y-8 px-5 py-10">
        <header className="rounded-3xl border border-base-300 bg-base-200 p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Jordan&apos;s Schedules</h1>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToPreviousWeek}
                aria-label="Previous week"
                disabled={weekIndex === 0}
              >
                &lt;
              </button>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral">
                Vecka {weekNumber}
              </p>
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToNextWeek}
                aria-label="Next week"
                disabled={weekIndex === programWeeks.length - 1}
              >
                &gt;
              </button>
            </div>
          </div>

          <WeekScheduleView
            week={activeWeek}
            weekNumber={weekNumber}
            title="Training dashboard"
            emptyWeekTitle="Inget program"
            emptyWeekDescription="Ingen data för veckan."
          />
        </section>
      </div>
    </div>
  );
}
