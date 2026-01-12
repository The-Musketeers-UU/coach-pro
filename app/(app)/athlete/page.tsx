"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  WeekSelector,
  createRollingWeekOptions,
  getCurrentWeekValue,
  getWeekSelection,
} from "@/components/WeekSelector";

import {
  WeekScheduleView,
  type FeedbackFieldKey,
  type FeedbackFieldDefinition,
  type ProgramWeek,
} from "@/components/WeekScheduleView";

import { useAuth } from "@/components/auth-provider";
import {
  type ScheduleWeekWithModules,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import { coerceYearWeekNumber, formatIsoWeekMonthYear, getIsoWeekInfo } from "@/lib/week";

const dayLabels = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
];

const toProgramWeek = (week: ScheduleWeekWithModules): ProgramWeek => {
  const weekInfo = coerceYearWeekNumber(week.week);
  const weekLabelNumber = weekInfo?.weekNumber ?? week.week;

  return {
    id: week.id,
    label: week.title || `Vecka ${weekLabelNumber}`,
    days: week.days.map((day) => ({
      id: day.id,
      label: dayLabels[day.day - 1] ?? `Dag ${day.day}`,
      dayNumber: day.day,
      modules: day.modules.map((module) => {
        const responses = module.feedback?.responses ?? [];

        const byType = new Map<FeedbackFieldKey, number | string | null>();
        for (const r of responses) byType.set(r.type, r.value);

        const getNumeric = (type: FeedbackFieldKey) => {
          const matched = byType.get(type);
          if (matched === null || matched === undefined) return null;
          const parsed = Number(matched);
          return Number.isFinite(parsed) ? parsed : null;
        };

        const getText = (type: FeedbackFieldKey) => {
          const matched = byType.get(type);
          return matched === null || matched === undefined ? null : String(matched);
        };

        return {
          id: module.id,
          scheduleDayId: module.scheduleDayId,
          title: module.name,
          description: module.description ?? "",
          category: module.category,
          subcategory: module.subCategory ?? undefined,
          distance: getNumeric("distance"),
          weight: getNumeric("weight"),
          duration: getNumeric("duration"),
          comment: getText("comment"),
          feeling: getNumeric("feeling"),
          sleepHours: getNumeric("sleepHours"),
          feedbackFields: module.activeFeedbackFields ?? [],
          feedbackResponses: responses,
        };
      }),
    })),
  };
};

export default function AthleteSchedulePage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const weekOptions = useMemo(() => createRollingWeekOptions(), []);
  const currentWeekValue = useMemo(() => getCurrentWeekValue(), []);
  const [selectedWeekValue, setSelectedWeekValue] = useState(currentWeekValue);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentWeekInfo = useMemo(() => getIsoWeekInfo(new Date()), []);
  const currentWeekNumber = currentWeekInfo.weekNumber;
  const currentYearWeek = currentWeekInfo.yearWeek;
  const availableWeeks = useMemo(
    () =>
      new Set(
        rawWeeks.map((week) => coerceYearWeekNumber(week.week)?.yearWeek ?? week.week),
      ),
    [rawWeeks],
  );
  const weekSelection = useMemo(
    () => getWeekSelection({ weekOptions, selectedWeekValue, currentWeekValue }),
    [currentWeekValue, selectedWeekValue, weekOptions],
  );
  const weekNumber = weekSelection.weekNumber ?? currentWeekNumber;
  const selectedYearWeek = weekSelection.yearWeek ?? currentYearWeek;
  const activeWeek = useMemo(() => {
    const weekWithData = rawWeeks.find((week) => {
      const weekInfo = coerceYearWeekNumber(week.week);
      return weekInfo ? weekInfo.yearWeek === selectedYearWeek : week.week === selectedYearWeek;
    });
    return weekWithData ? toProgramWeek(weekWithData) : undefined;
  }, [rawWeeks, selectedYearWeek]);

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
      }
    };

    void loadWeeks();
  }, [currentWeekNumber, profile?.id]);

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;
    if (!user) {
      router.replace("/login?redirectTo=/athlete");
    }
  }, [isLoading, isLoadingProfile, router, user]);

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar program" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar program" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-full space-y-5 px-5 py-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <p className="text-lg font-medium uppercase tracking-wide text-base-content/70">
            {formatIsoWeekMonthYear(
              weekSelection.weekNumber,
              weekSelection.weekReferenceDate,
            )}
          </p>

          <div className="flex justify-center">
            <WeekSelector
              weekOptions={weekOptions}
              selectedWeekValue={selectedWeekValue}
              currentWeekValue={currentWeekValue}
              availableWeeks={availableWeeks}
              onChange={setSelectedWeekValue}
              onPrevious={goToPreviousWeek}
              onNext={goToNextWeek}
              className="md:flex-row md:items-center md:gap-4"
              showMonthLabel={false}
            />
          </div>

          <div className="hidden md:block" />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <WeekScheduleView
          week={activeWeek}
          weekNumber={weekNumber}
          weekReferenceDate={weekSelection.weekReferenceDate}
          emptyWeekTitle="Inget schema"
          emptyWeekDescription="Det finns inget schema för den här veckan."
          viewerRole="athlete"
          athleteId={profile?.id}
        />
      </div>
    </div>
  );
}
