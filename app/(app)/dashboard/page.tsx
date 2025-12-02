"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { WeekScheduleView, type ProgramWeek } from "@/components/WeekScheduleView";
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

const parseSubcategories = (
  value?: string | string[] | null
): string[] | undefined => {
  if (!value) return undefined;

  const values = Array.isArray(value) ? value : value.split(",");
  const normalized = values.map((entry) => entry.trim()).filter(Boolean);

  return normalized.length ? normalized : undefined;
};

const toProgramWeek = (week: ScheduleWeekWithModules): ProgramWeek => ({
  id: week.id,
  label: `Vecka ${week.week}`,
  focus: `Ägare: ${week.owner}`,
  days: week.days.map((day) => ({
    id: day.id,
    label: dayLabels[day.day - 1] ?? `Dag ${day.day}`,
    modules: day.modules.map((module) => ({
      id: module.id.toString(),
      title: module.name,
      description: module.description ?? "",
      category: module.category,
      subcategory: parseSubcategories(module.subCategory),
      distanceMeters: module.distance ? [module.distance] : undefined,
      weightKg: module.weight ? [module.weight] : undefined,
      duration:
        module.durationMinutes !== null || module.durationSeconds !== null
          ? [
              {
                minutes: module.durationMinutes ?? undefined,
                seconds: module.durationSeconds ?? undefined,
              },
            ]
          : undefined,
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
      return;
    }

    if (!profile?.isCoach) {
      router.replace("/athlete");
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
            : String(supabaseError),
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
            : String(supabaseError),
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
        <div className="grid grid-cols-3">
          <h1 className="text-xl font-semibold pl-5">Schemabyggare</h1>

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
              <p className="badge-md badge badge-outline badge-secondary font-semibold uppercase tracking-wide">
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

          <div className="flex items-center justify-end">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleModifyWeek}
              disabled={!activeWeekId}
            >
              Redigera vecka
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <label className="form-control max-w-sm">
            <span className="label-text">Välj atlet</span>
            <select
              className="select select-bordered"
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
          </label>

          {selectedAthlete && (
            <p className="text-sm text-base-content/70">
              Visar program från Supabase för den valda atleten.
            </p>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {viewWeeks.length === 0 ? (
          <WeekScheduleView
            week={undefined}
            weekNumber={weekNumber}
            emptyWeekTitle="Inget program"
            emptyWeekDescription="Ingen data hittades i Supabase."
          />
        ) : (
          <WeekScheduleView
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
