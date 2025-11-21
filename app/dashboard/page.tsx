"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAthletes,
  getScheduleWeeksByAthlete,
  type AthleteRow,
  type ScheduleWeekRow,
} from "@/lib/supabase/training-modules";

export default function TrainingDashboardPage() {
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [athleteSchedules, setAthleteSchedules] = useState<ScheduleWeekRow[]>([]);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAthletes = async () => {
      setIsLoadingAthletes(true);
      setError(null);
      try {
        const athleteRows = await getAthletes();
        setAthletes(athleteRows);
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        );
      } finally {
        setIsLoadingAthletes(false);
      }
    };

    void fetchAthletes();
  }, []);

  const handleSelectAthlete = async (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsLoadingSchedules(true);
    setError(null);

    try {
      const weeks = await getScheduleWeeksByAthlete(athleteId);
      setAthleteSchedules(weeks);
    } catch (supabaseError) {
      setError(
        supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
      );
      setAthleteSchedules([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  const selectedAthlete = useMemo(
    () => athletes.find((athlete) => athlete.id === selectedAthleteId),
    [athletes, selectedAthleteId],
  );

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Training dashboard</p>
          <h1 className="text-3xl font-semibold">Browse athletes</h1>
          <p className="text-sm text-base-content/70">
            Pull athletes from Supabase, pick one, and inspect every schedule week linked to them.
          </p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <section className="rounded-3xl border border-base-300 bg-base-200 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Athletes</p>
              <h2 className="text-xl font-semibold">Roster pulled from Supabase</h2>
              <p className="text-sm text-base-content/70">Tap an athlete to load their schedule weeks.</p>
            </div>
            {isLoadingAthletes && (
              <span className="loading loading-spinner" aria-label="Loading athletes" />
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((athlete) => {
              const isActive = athlete.id === selectedAthleteId;
              return (
                <button
                  key={athlete.id}
                  type="button"
                  onClick={() => void handleSelectAthlete(athlete.id)}
                  className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-primary ${
                    isActive
                      ? "border-primary bg-primary text-primary-content"
                      : "border-base-300 bg-base-100"
                  }`}
                >
                  <span className="text-sm font-semibold">{athlete.name}</span>
                  <span className={`text-xs ${isActive ? "text-primary-content/80" : "text-base-content/70"}`}>
                    {athlete.email}
                  </span>
                </button>
              );
            })}

            {!isLoadingAthletes && athletes.length === 0 && (
              <p className="col-span-full text-sm text-base-content/70">No athletes found in Supabase yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-3xl border border-base-300 bg-base-200 p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral">Schedules</p>
              <h2 className="text-xl font-semibold">
                {selectedAthlete ? `${selectedAthlete.name}'s schedule weeks` : "Select an athlete"}
              </h2>
              <p className="text-sm text-base-content/70">
                Each entry represents a week assigned to the athlete. Use the IDs when linking modules.
              </p>
            </div>
            {isLoadingSchedules && (
              <span className="loading loading-spinner" aria-label="Loading schedules" />
            )}
          </div>

          {selectedAthlete ? (
            athleteSchedules.length ? (
              <ul className="space-y-2">
                {athleteSchedules.map((week) => (
                  <li
                    key={week.id}
                    className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Week {week.week}</p>
                      <p className="text-xs text-base-content/70">Schedule ID: {week.id}</p>
                    </div>
                    <span className="badge badge-outline">Coach: {week.owner}</span>
                  </li>
                ))}
              </ul>
            ) : isLoadingSchedules ? null : (
              <p className="text-sm text-base-content/70">No schedules linked to this athlete yet.</p>
            )
          ) : (
            <p className="text-sm text-base-content/70">Choose an athlete above to see their schedules.</p>
          )}
        </section>
      </div>
    </div>
  );
}
