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
import { formatIsoWeekMonthYear, getIsoWeekNumber } from "@/lib/week";

type WeekOption = {
  value: string;
  label: string;
  weekNumber: number;
  startDate: Date;
};

const MILLISECONDS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

const getIsoWeekInfo = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / MILLISECONDS_IN_WEEK);

  return { weekNumber, year: target.getUTCFullYear() } as const;
};

const getStartOfIsoWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const createRollingWeekOptions = (): WeekOption[] => {
  const today = new Date();
  const startOfCurrentWeek = getStartOfIsoWeek(today);
  const startDate = new Date(startOfCurrentWeek);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const endDate = new Date(startOfCurrentWeek);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const options: WeekOption[] = [];
  let currentWeekStart = startDate;

  while (currentWeekStart <= endDate) {
    const { weekNumber, year } = getIsoWeekInfo(currentWeekStart);
    const value = `${year}-W${weekNumber}`;
    const label = `Vecka ${weekNumber} (${year})`;

    options.push({
      value,
      label,
      weekNumber,
      startDate: new Date(currentWeekStart),
    });

    currentWeekStart = new Date(currentWeekStart.getTime() + MILLISECONDS_IN_WEEK);
  }

  return options;
};

const parseWeekNumber = (value: string): number | null => {
  const match = /^\d{4}-W(\d{1,2})$/.exec(value);
  if (!match) return null;

  const week = Number(match[1]);
  return Number.isNaN(week) ? null : week;
};

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
  const weekOptions = useMemo(() => createRollingWeekOptions(), []);
  const currentWeekValue = useMemo(() => {
    const startOfCurrentWeek = getStartOfIsoWeek(new Date());
    const { weekNumber, year } = getIsoWeekInfo(startOfCurrentWeek);

    return `${year}-W${weekNumber}`;
  }, []);
  const [selectedWeekValue, setSelectedWeekValue] = useState(currentWeekValue);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = useMemo(() => getIsoWeekNumber(new Date()), []);
  const availableWeeks = useMemo(
    () => new Set(rawWeeks.map((week) => week.week)),
    [rawWeeks]
  );
  const activeWeekOption = useMemo(() => {
    if (weekOptions.length === 0) return undefined;

    return (
      weekOptions.find((option) => option.value === selectedWeekValue) ??
      weekOptions.find((option) => option.value === currentWeekValue) ??
      weekOptions[0]
    );
  }, [currentWeekValue, selectedWeekValue, weekOptions]);
  const weekNumber = useMemo(
    () =>
      parseWeekNumber(activeWeekOption?.value ?? currentWeekValue) ??
      currentWeekNumber,
    [activeWeekOption?.value, currentWeekNumber, currentWeekValue],
  );
  const weekReferenceDate = activeWeekOption?.startDate ?? new Date();
  const activeWeek = useMemo(() => {
    const weekWithData = rawWeeks.find((week) => week.week === weekNumber);
    return weekWithData ? toProgramWeek(weekWithData) : undefined;
  }, [rawWeeks, weekNumber]);
  const activeWeekIndex = useMemo(
    () =>
      activeWeekOption
        ? weekOptions.findIndex((option) => option.value === activeWeekOption.value)
        : -1,
    [activeWeekOption, weekOptions],
  );
  const isFirstSelectableWeek = activeWeekIndex <= 0;
  const isLastSelectableWeek =
    activeWeekIndex === -1 || activeWeekIndex >= weekOptions.length - 1;

  const goToPreviousWeek = () =>
    setSelectedWeekValue((previous) => {
      const previousIndex = weekOptions.findIndex(
        (option) => option.value === previous,
      );

      if (previousIndex <= 0) return previous;

      return weekOptions[previousIndex - 1]?.value ?? previous;
    });

  const goToNextWeek = () =>
    setSelectedWeekValue((previous) => {
      const previousIndex = weekOptions.findIndex(
        (option) => option.value === previous,
      );
      if (previousIndex === -1) return previous;

      const nextIndex = Math.min(weekOptions.length - 1, previousIndex + 1);
      return weekOptions[nextIndex]?.value ?? previous;
    });

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
          {formatIsoWeekMonthYear(weekNumber, weekReferenceDate)}
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between justify-self-center">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-outline btn-xs btn-primary"
              onClick={goToPreviousWeek}
              aria-label="Previous week"
              disabled={isFirstSelectableWeek}
            >
              &lt;
            </button>

            <div className="flex flex-col items-center gap-1">
              <select
                className="select select-bordered select-sm min-w-[110px] uppercase tracking-wide"
                value={activeWeekOption?.value ?? currentWeekValue}
                onChange={(event) => setSelectedWeekValue(event.target.value)}
              >
                {weekOptions.map((weekOption) => {
                  const hasSchedule = availableWeeks.has(weekOption.weekNumber);

                  return (
                    <option
                      key={weekOption.value}
                      value={weekOption.value}
                      className={
                        hasSchedule
                          ? "text-base-content"
                          : "text-base-content/50"
                      }
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
              disabled={isLastSelectableWeek}
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
