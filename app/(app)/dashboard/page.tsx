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
  type AthleteRow,
  type ScheduleWeekWithModules,
  getAthletes,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import {
  findClosestWeekIndex,
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
  focus: `Ägare: ${week.owner}`,
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
});

export default function AthleteSchedulePage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const weekOptions = useMemo(() => createRollingWeekOptions(), []);
  const currentWeekValue = useMemo(() => getCurrentWeekValue(), []);
  const [selectedWeekValue, setSelectedWeekValue] = useState(currentWeekValue);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = useMemo(() => getIsoWeekNumber(new Date()), []);
  const availableWeeks = useMemo(
    () => new Set(rawWeeks.map((week) => week.week)),
    [rawWeeks],
  );
  const weekSelection = useMemo(
    () => getWeekSelection({ weekOptions, selectedWeekValue, currentWeekValue }),
    [currentWeekValue, selectedWeekValue, weekOptions],
  );
  const weekNumber = weekSelection.weekNumber ?? currentWeekNumber;
  const activeWeekData = useMemo(
    () => rawWeeks.find((week) => week.week === weekNumber),
    [rawWeeks, weekNumber],
  );
  const activeWeek = useMemo(
    () => (activeWeekData ? toProgramWeek(activeWeekData) : undefined),
    [activeWeekData],
  );
  const activeWeekId = activeWeekData?.id;

  const goToPreviousWeek = () =>
    setSelectedWeekValue((previous) => {
      const previousIndex = weekOptions.findIndex((option) => option.value === previous);

      if (previousIndex <= 0) return previous;

      return weekOptions[previousIndex - 1]?.value ?? previous;
    });

  const goToNextWeek = () =>
    setSelectedWeekValue((previous) => {
      const previousIndex = weekOptions.findIndex((option) => option.value === previous);
      if (previousIndex === -1) return previous;

      const nextIndex = Math.min(weekOptions.length - 1, previousIndex + 1);
      return weekOptions[nextIndex]?.value ?? previous;
    });

  const handleModifyWeek = () => {
    if (!activeWeekId) return;

    router.push(`/schedule_builder?weekId=${activeWeekId}`);
  };

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/dashboard");
      console.log("No user !")
      return;
    }

    if (!profile?.isCoach) {
      router.replace("/athlete");
      console.log("user is athlete");
    } else {
      console.log("User is a coach");
    }
  }, [isLoading, isLoadingProfile, profile?.isCoach, router, user]);

  useEffect(() => {
    if (!profile?.isCoach) return;

    const loadAthletes = async () => {
      setError(null);
      try {
        const athleteRows = await getAthletes();
        setAthletes(athleteRows);
        setSelectedAthlete((current) => current || athleteRows[0]?.id || "");
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error
            ? supabaseError.message
            : String(supabaseError)
        );
      }
    };

    void loadAthletes();
  }, [profile?.isCoach]);

  useEffect(() => {
    if (!selectedAthlete || !profile?.isCoach) return;

    const loadWeeks = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const weeks = await getScheduleWeeksWithModules(selectedAthlete);
        setRawWeeks(weeks);
        const closestWeekIndex = findClosestWeekIndex(weeks, currentWeekNumber);
        const closestWeekNumber = weeks[closestWeekIndex]?.week;

        if (closestWeekNumber) {
          const closestWeekValue = weekOptions.find(
            (option) => option.weekNumber === closestWeekNumber,
          )?.value;

          if (closestWeekValue) {
            setSelectedWeekValue(closestWeekValue);
          }
        }
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
  }, [currentWeekNumber, profile?.isCoach, selectedAthlete, weekOptions]);

  if (isLoading || isLoadingProfile || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar scheman" />
      </div>
    );
  }

  if (!user) return null;

  if (!profile?.isCoach) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Omdirigerar" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-full space-y-5 px-5 py-5">
        <div className="flex gap-4 flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="hidden pl-5 text-xl font-semibold sm:block w-[26vw]">
            Träningsöversikt
          </h1>

          <WeekSelector
            weekOptions={weekOptions}
            selectedWeekValue={selectedWeekValue}
            currentWeekValue={currentWeekValue}
            availableWeeks={availableWeeks}
            onChange={setSelectedWeekValue}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
            className="md:flex-row md:items-center md:gap-4"
          />

          <div className="flex w-full max-w-sm items-center gap-2">
            <span className="whitespace-nowrap text-sm">Atlet:</span>

            <select
              className="select select-bordered select-sm flex-1"
              value={selectedAthlete}
              onChange={(event) => setSelectedAthlete(event.target.value)}
              disabled={athletes.length === 0}
            >
              <option value="" disabled>
                {athletes.length === 0 ? "Inga atleter" : "Välj en atlet"}
              </option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} ({athlete.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <WeekScheduleView
          week={activeWeek}
          weekNumber={weekNumber}
          emptyWeekTitle="Inget schema"
          emptyWeekDescription="Det finns inget schema för den här veckan."
          headerAction={
            <button
              className="btn btn-primary btn-soft btn-sm"
              onClick={handleModifyWeek}
              disabled={!activeWeekId}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-primary sm:hidden"
                aria-hidden
              >
                <path d="M12.8995 6.85453L17.1421 11.0972L7.24264 20.9967H3V16.754L12.8995 6.85453ZM14.3137 5.44032L16.435 3.319C16.8256 2.92848 17.4587 2.92848 17.8492 3.319L20.6777 6.14743C21.0682 6.53795 21.0682 7.17112 20.6777 7.56164L18.5563 9.68296L14.3137 5.44032Z"></path>
              </svg>
              <span className="sr-only sm:not-sr-only sm:inline">Redigera schema</span>
            </button>
          }
          viewerRole="coach"
          athleteId={selectedAthlete}
          coachId={profile?.id}
        />
      </div>
    </div>
  );
}
