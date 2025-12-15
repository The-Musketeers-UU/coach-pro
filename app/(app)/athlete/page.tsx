"use client";

import { useEffect, useMemo, useState } from "react";

import {
  WeekScheduleView,
  type ProgramWeek,
} from "@/components/WeekScheduleView";
import { useAuth } from "@/components/auth-provider";
import {
  type ScheduleWeekWithModules,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import {
  formatIsoWeekMonthYear,
  getDateRangeForIsoWeek,
  getIsoWeekNumber,
} from "@/lib/week";

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
  focus: ``,
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
    getIsoWeekNumber(new Date())
  );
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = useMemo(() => getIsoWeekNumber(new Date()), []);

  const weekOptions = useMemo(
    () =>
      Array.from({ length: 53 }, (_, i) => {
        const week = i + 1;
        const { isoYear } = getDateRangeForIsoWeek(week);

        return {
          week,
          isoYear,
          label: `Vecka ${week} (${isoYear})`,
        };
      }),
    []
  );
  const availableWeeks = useMemo(() => {
    const weeksWithSchedules = rawWeeks.filter((week) =>
      week.days.some((day) => day.modules.length > 0)
    );

    return new Set(weeksWithSchedules.map((week) => week.week));
  }, [rawWeeks]);
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
            : String(supabaseError)
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
        <p className="text-md font-medium uppercase tracking-wide text-base-content/60 text-center">
          {formatIsoWeekMonthYear(weekNumber)}
        </p>
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
              <select
                className="select select-bordered select-sm min-w-[110px] uppercase tracking-wide"
                value={weekNumber}
                onChange={(event) =>
                  setSelectedWeek(Number(event.target.value))
                }
              >
                {weekOptions.map((weekOption) => {
                  const hasSchedule = availableWeeks.has(weekOption.week);

                  return (
                    <option
                      key={weekOption.week}
                      value={weekOption.week}
                      className={
                        hasSchedule
                          ? "text-base-content"
                          : "text-base-content/50"
                      }
                      style={{
                        color: hasSchedule
                          ? "hsl(var(--bc))"
                          : "hsl(var(--bc) / 0.5)",
                      }}
                    >
                      {weekOption.label}
                    </option>
                  );
                })}
              </select>
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
