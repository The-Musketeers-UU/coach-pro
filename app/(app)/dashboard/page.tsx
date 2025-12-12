"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  WeekScheduleView,
  type ProgramWeek,
} from "@/components/WeekScheduleView";
import { useAuth } from "@/components/auth-provider";
import {
  type AthleteRow,
  type ScheduleWeekWithModules,
  getAthletes,
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
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [weekIndex, setWeekIndex] = useState(0);
  const [rawWeeks, setRawWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWeekNumber = getIsoWeekNumber(new Date());

  const viewWeeks = useMemo(() => rawWeeks.map(toProgramWeek), [rawWeeks]);
  const activeWeek = viewWeeks[weekIndex];
  const weekNumber = rawWeeks[weekIndex]?.week ?? currentWeekNumber;
  const activeWeekId = rawWeeks[weekIndex]?.id;

  const goToPreviousWeek = () => setWeekIndex((prev) => Math.max(0, prev - 1));

  const goToNextWeek = () =>
    setWeekIndex((prev) => Math.min(viewWeeks.length - 1, prev + 1));

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
      console.log("user is athlete")
    }else{
     console.log("User is a coach")
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
        setWeekIndex(findClosestWeekIndex(weeks, currentWeekNumber));
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
  }, [currentWeekNumber, profile?.isCoach, selectedAthlete]);

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
        <div className="flex gap-4 flex-row items-center justify-between">
          <h1 className="hidden pl-5 text-xl font-semibold sm:block w-[26vw]">
            Träningsöversikt
          </h1>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToPreviousWeek}
                aria-label="Previous week"
                disabled={weekIndex === 0}
              >
                &lt;
              </button>
              <p className="badge-md w-[100px] badge badge-outline badge-secondary font-semibold uppercase tracking-wide">
                Vecka {weekNumber}
              </p>
              <button
                className="btn btn-outline btn-xs btn-primary"
                onClick={goToNextWeek}
                aria-label="Next week"
                disabled={
                  weekIndex === viewWeeks.length - 1 || viewWeeks.length === 0
                }
              >
                &gt;
              </button>
            </div>
          </div>

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

        {viewWeeks.length === 0 ? (
          <WeekScheduleView
            week={undefined}
            weekNumber={weekNumber}
            emptyWeekTitle="Inget schema"
            emptyWeekDescription="Det finns inget schema för den här veckan."
            viewerRole="coach"
            athleteId={selectedAthlete}
            coachId={profile?.id}
          />
        ) : (
          <WeekScheduleView
            week={activeWeek}
            weekNumber={weekNumber}
            emptyWeekTitle="Inget program"
            emptyWeekDescription="Ingen data för veckan."
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
                <span className="sr-only sm:not-sr-only sm:inline">
                  Redigera schema
                </span>
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
