"use client";

import { useEffect, useMemo, useState } from "react";

import {
  WeekSelector,
  createRollingWeekOptions,
  getCurrentWeekValue,
  getWeekSelection,
} from "@/components/WeekSelector";
import {
  WeekScheduleView,
  type ProgramWeek,
} from "@/components/WeekScheduleView";
import { useAuth } from "@/components/auth-provider";
import {
  type ScheduleWeekWithModules,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import { getIsoWeekNumber } from "@/lib/week";

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
  const currentWeekValue = useMemo(() => getCurrentWeekValue(), []);
  const [selectedWeekValue, setSelectedWeekValue] = useState(currentWeekValue);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = useMemo(() => getIsoWeekNumber(new Date()), []);
  const availableWeeks = useMemo(
    () => new Set(rawWeeks.map((week) => week.week)),
    [rawWeeks]
  );
  const weekSelection = useMemo(
    () => getWeekSelection({ weekOptions, selectedWeekValue, currentWeekValue }),
    [currentWeekValue, selectedWeekValue, weekOptions],
  );
  const weekNumber = weekSelection.weekNumber ?? currentWeekNumber;
  const activeWeek = useMemo(() => {
    const weekWithData = rawWeeks.find((week) => week.week === weekNumber);
    return weekWithData ? toProgramWeek(weekWithData) : undefined;
  }, [rawWeeks, weekNumber]);

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
        <div className="flex justify-center">
          <WeekSelector
            weekOptions={weekOptions}
            selectedWeekValue={selectedWeekValue}
            currentWeekValue={currentWeekValue}
            availableWeeks={availableWeeks}
            onChange={setSelectedWeekValue}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
            className="md:flex-row"
          />
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
