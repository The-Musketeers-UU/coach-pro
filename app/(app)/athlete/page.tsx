"use client";

import { useEffect, useMemo, useState } from "react";

import { WeekScheduleView, type ProgramWeek } from "@/components/WeekScheduleView";
import { useAuth } from "@/components/auth-provider";
import {
  type ScheduleWeekWithModules,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import { formatIsoWeekMonthYear, getIsoWeekNumber } from "@/lib/week";

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
    dayNumber: day.day,
    modules: day.modules.map((module) => ({
      id: module.id,
      scheduleDayId: module.scheduleDayId,
      title: module.name,
      description: module.description ?? "",
      category: module.category,
      subcategory: module.subCategory ?? undefined,
      distance: module.feedback?.distance ?? module.distance,
      weight: module.feedback?.weight ?? module.weight,
      duration: module.feedback?.duration ?? module.duration,
      comment: module.feedback?.comment ?? module.comment,
      feeling: module.feedback?.feeling ?? module.feeling,
      sleepHours: module.feedback?.sleepHours ?? module.sleepHours,
      feedback: module.feedback && {
        distance: module.feedback.distance,
        weight: module.feedback.weight,
        duration: module.feedback.duration,
        comment: module.feedback.comment,
        feeling: module.feedback.feeling,
        sleepHours: module.feedback.sleepHours,
      },
    })),
  })),
});

export default function AthleteSchedulePage() {
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(() =>
    getIsoWeekNumber(new Date()),
  );
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = useMemo(() => getIsoWeekNumber(new Date()), []);

  const weekOptions = useMemo(() => Array.from({ length: 53 }, (_, i) => i + 1), []);
  const availableWeeks = useMemo(
    () => new Set(rawWeeks.map((week) => week.week)),
    [rawWeeks],
  );
  const activeWeek = useMemo(() => {
    const weekWithData = rawWeeks.find((week) => week.week === selectedWeek);
    return weekWithData ? toProgramWeek(weekWithData) : undefined;
  }, [rawWeeks, selectedWeek]);
  const weekNumber = selectedWeek || currentWeekNumber;

  const goToPreviousWeek = () =>
    setSelectedWeek((prev) => (prev > 1 ? prev - 1 : 1));

  const goToNextWeek = () =>
    setSelectedWeek((prev) => (prev < 53 ? prev + 1 : 53));

  useEffect(() => {
    if (!profile?.id) return;

    const loadWeeks = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const weeks = await getScheduleWeeksWithModules(profile.id);
        setRawWeeks(weeks);
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
              disabled={weekNumber <= 1}
            >
              &lt;
            </button>

            <div className="flex flex-col items-center gap-1">
              <div className="dropdown dropdown-end">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-outline btn-secondary btn-sm min-w-[128px] justify-between font-semibold uppercase tracking-wide"
                >
                  <span>Vecka {weekNumber}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 9l5.25 5.25L17.25 9"
                    />
                  </svg>
                </button>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu menu-vertical rounded-box z-10 mt-2 max-h-96 w-44 overflow-y-auto overflow-x-hidden border border-base-200 bg-base-100 p-2 shadow"
                >
                  {weekOptions.map((weekOption) => {
                    const hasSchedule = availableWeeks.has(weekOption);
                    const isActive = weekOption === weekNumber;

                    return (
                      <li key={weekOption}>
                        <button
                          type="button"
                          onClick={() => setSelectedWeek(weekOption)}
                          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                            isActive ? "bg-primary/10 font-semibold text-primary" : ""
                          } ${hasSchedule ? "text-base-content" : "text-base-content/50"}`}
                        >
                          <span>Vecka {weekOption}</span>
                          <span
                            className={`badge badge-xs border-transparent ${
                              hasSchedule ? "bg-base-content" : "bg-base-300"
                            }`}
                            aria-label={
                              hasSchedule
                                ? "Schema finns för veckan"
                                : "Inget schema för veckan"
                            }
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/60">
                {formatIsoWeekMonthYear(weekNumber)}
              </p>
            </div>

            <button
              className="btn btn-outline btn-xs btn-primary"
              onClick={goToNextWeek}
              aria-label="Next week"
              disabled={weekNumber >= 53}
            >
              &gt;
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <WeekScheduleView
          week={activeWeek}
          weekNumber={weekNumber}
          emptyWeekTitle="Inget schema"
          emptyWeekDescription="Det finns inget schema för den här veckan."
          viewerRole="athlete"
          athleteId={profile?.id}
        />
      </div>
    </div>
  );
}
