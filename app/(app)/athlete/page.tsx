"use client";

import { useEffect, useMemo, useState } from "react";

import { WeekScheduleView, type ProgramWeek } from "@/components/WeekScheduleView";
import { useAuth } from "@/components/auth-provider";
import {
  type ScheduleWeekWithModules,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import { findClosestWeekIndex, getIsoWeekNumber } from "@/lib/week";

const dayLabels = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

const toProgramWeek = (week: ScheduleWeekWithModules): ProgramWeek => ({
  id: week.id,
  label: week.title || `Vecka ${week.week}`,
  focus: `Ägare: ${week.owner}`,
  days: week.days.map((day) => ({
    id: day.id,
    label: dayLabels[day.day - 1] ?? `Dag ${day.day}`,
    modules: day.modules.map((module) => ({
      title: module.name,
      description: module.description ?? "",
      category: module.category,
      subcategory: module.subCategory ?? undefined,
      distanceMeters: module.distance ?? undefined,
      weightKg: module.weight ?? undefined,
      durationMinutes: module.durationMinutes ?? undefined,
      durationSeconds: module.durationSeconds ?? undefined,
    })),
  })),
});

export default function AthleteSchedulePage() {
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [weekIndex, setWeekIndex] = useState(0);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = getIsoWeekNumber(new Date());

  const viewWeeks = useMemo(() => rawWeeks.map(toProgramWeek), [rawWeeks]);
  const safeWeekIndex = Math.min(
    Math.max(weekIndex, 0),
    Math.max(viewWeeks.length - 1, 0),
  );
  const activeWeek = viewWeeks[safeWeekIndex];
  const weekNumber = rawWeeks[safeWeekIndex]?.week ?? currentWeekNumber;
  const weekKey = activeWeek?.id ?? "empty-week";

  const goToPreviousWeek = () =>
    setWeekIndex((prev) => Math.max(0, Math.min(prev, viewWeeks.length - 1) - 1));

  const goToNextWeek = () =>
    setWeekIndex((prev) => Math.min(viewWeeks.length - 1, prev + 1));

  useEffect(() => {
    if (!profile?.id) return;

    const loadWeeks = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const weeks = await getScheduleWeeksWithModules(profile.id);
        setRawWeeks(weeks);
        setWeekIndex(findClosestWeekIndex(weeks, currentWeekNumber));
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError),
        );
      } finally {
        setIsFetching(false);
      }
    };

    void loadWeeks();
  }, [currentWeekNumber, profile?.id]);

  if (isLoading || isLoadingProfile || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar program" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-full space-y-5 px-5 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between justify-self-center">
            <div className="flex items-center gap-3">
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToPreviousWeek}
                aria-label="Previous week"
                disabled={weekIndex === 0}
              >
                &lt;
              </button>
              <p className="badge-md badge badge-outline badge-secondary font-semibold uppercase tracking-wide min-w-[100px]">
                Vecka {weekNumber} 
              </p>
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToNextWeek}
                aria-label="Next week"
                disabled={weekIndex === viewWeeks.length - 1 || viewWeeks.length === 0}
              >
                &gt;
              </button>
            </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {viewWeeks.length === 0 ? (
          <WeekScheduleView
            key="empty-week"
            week={undefined}
            weekNumber={weekNumber}
            emptyWeekTitle="Inget program"
            emptyWeekDescription="Ingen data hittades i Supabase."
          />
        ) : (
          <WeekScheduleView
            key={weekKey}
            week={activeWeek}
            weekNumber={weekNumber}
            emptyWeekTitle="Inget program"
            emptyWeekDescription="Ingen data för veckan."
          />
        )}
      </div>
    </div>
  );
}
