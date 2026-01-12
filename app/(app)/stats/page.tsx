"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import {
  type AthleteRow,
  type ScheduleWeekWithModules,
  getCoachAthletes,
  getScheduleWeeksWithModules,
} from "@/lib/supabase/training-modules";
import { coerceYearWeekNumber } from "@/lib/week";

const athleteGraphLink=[  { href: "/graph", label: "graph" },
]
type ScheduleModule = ScheduleWeekWithModules["days"][number]["modules"][number];

type WeekStats = {
  id: string;
  label: string;
  weekNumber: number;
  yearWeek: number;
  year?: number;
  assignedModules: number;
  loggedModules: number;
  completionRate: number;
  distance: number;
  duration: number;
  weight: number;
  avgFeeling: number | null;
  avgSleep: number | null;
  comments: number;
};

type DataCoverage = {
  distance: number;
  duration: number;
  weight: number;
  feeling: number;
  sleepHours: number;
  comment: number;
  total: number;
};

const moduleHasFeedback = (module: ScheduleModule) => {
  const feedback = module.feedback;
  if (!feedback) return false;

  return Boolean(
    feedback.distance !== null && feedback.distance !== undefined ||
      feedback.duration !== null && feedback.duration !== undefined ||
      feedback.weight !== null && feedback.weight !== undefined ||
      feedback.feeling !== null && feedback.feeling !== undefined ||
      feedback.sleepHours !== null && feedback.sleepHours !== undefined ||
      (feedback.comment && feedback.comment.trim()),
  );
};

const aggregateLoggedModules = (modules: ScheduleModule[]) => {
  const logged = modules.filter(moduleHasFeedback);
  const feelings: number[] = [];
  const sleepHours: number[] = [];

  const totals = logged.reduce(
    (acc, module) => {
      const feedback = module.feedback;
      if (!feedback) return acc;

      acc.distance += feedback.distance ?? 0;
      acc.duration += feedback.duration ?? 0;
      acc.weight += feedback.weight ?? 0;

      if (feedback.feeling !== null && feedback.feeling !== undefined) {
        feelings.push(feedback.feeling);
      }

      if (feedback.sleepHours !== null && feedback.sleepHours !== undefined) {
        sleepHours.push(feedback.sleepHours);
      }

      if (feedback.comment && feedback.comment.trim()) {
        acc.comments += 1;
      }

      return acc;
    },
    { distance: 0, duration: 0, weight: 0, comments: 0 },
  );

  const avgFeeling =
    feelings.length > 0
      ? feelings.reduce((sum, value) => sum + value, 0) / feelings.length
      : null;

  const avgSleep =
    sleepHours.length > 0
      ? sleepHours.reduce((sum, value) => sum + value, 0) / sleepHours.length
      : null;

  return {
    ...totals,
    avgFeeling,
    avgSleep,
    loggedCount: logged.length,
  };
};

const toWeekStats = (week: ScheduleWeekWithModules): WeekStats => {
  const weekInfo = coerceYearWeekNumber(week.week);
  const weekNumber = weekInfo?.weekNumber ?? week.week;
  const yearWeek = weekInfo?.yearWeek ?? week.week;
  const year = weekInfo?.year;
  const modules = week.days.flatMap((day) => day.modules);
  const metrics = aggregateLoggedModules(modules);

  return {
    id: week.id,
    label: week.title || `Vecka ${weekNumber}${year ? ` (${year})` : ""}`,
    weekNumber,
    yearWeek,
    year,
    assignedModules: modules.length,
    loggedModules: metrics.loggedCount,
    completionRate:
      modules.length > 0 ? Math.round((metrics.loggedCount / modules.length) * 100) : 0,
    distance: metrics.distance,
    duration: metrics.duration,
    weight: metrics.weight,
    avgFeeling: metrics.avgFeeling,
    avgSleep: metrics.avgSleep,
    comments: metrics.comments,
  };
};

const computeCoverage = (modules: ScheduleModule[]): DataCoverage => {
  const coverage: DataCoverage = {
    distance: 0,
    duration: 0,
    weight: 0,
    feeling: 0,
    sleepHours: 0,
    comment: 0,
    total: modules.length,
  };

  modules.forEach((module) => {
    const feedback = module.feedback;
    if (!feedback) return;

    if (feedback.distance !== null && feedback.distance !== undefined) {
      coverage.distance += 1;
    }

    if (feedback.duration !== null && feedback.duration !== undefined) {
      coverage.duration += 1;
    }

    if (feedback.weight !== null && feedback.weight !== undefined) {
      coverage.weight += 1;
    }

    if (feedback.feeling !== null && feedback.feeling !== undefined) {
      coverage.feeling += 1;
    }

    if (feedback.sleepHours !== null && feedback.sleepHours !== undefined) {
      coverage.sleepHours += 1;
    }

    if (feedback.comment && feedback.comment.trim()) {
      coverage.comment += 1;
    }
  });

  return coverage;
};

const formatDistance = (value: number) => {
  if (!value) return "0 m";
  return `${value.toLocaleString()} m`;
};

const formatDurationTotal = (value: number) => {
  if (!value) return "0 m";

  const totalMinutes = Math.round(value / 6000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} m`;

  return `${hours} h ${minutes} m`;
};

const formatWeight = (value: number) => {
  if (!value) return "0 kg";
  return `${value.toLocaleString()} kg`;
};

const formatAverage = (value: number | null, suffix = "") => {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value.toFixed(1)}${suffix}`;
};

export default function StatsPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [weeks, setWeeks] = useState<ScheduleWeekWithModules[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>("");
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(false);
  const [isFetchingWeeks, setIsFetchingWeeks] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const goToWeekGraph = (week: WeekStats) => {
    const params = new URLSearchParams();
    if (selectedAthlete) params.set("athleteId", selectedAthlete);
    params.set("weekNumber", String(week.yearWeek));

    const query = params.toString();
    router.push(`/stats/${week.id}${query ? `?${query}` : ""}`);
  };

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/stats");
      return;
    }

    if (!profile?.isCoach && profile?.id) {
      setSelectedAthlete(profile.id);
    }
  }, [isLoading, isLoadingProfile, profile?.id, profile?.isCoach, router, user]);

  useEffect(() => {
    if (!profile?.isCoach) return;

    const loadAthletes = async () => {
      setIsLoadingAthletes(true);
      setError(null);

      try {
        const athleteRows = await getCoachAthletes(profile.id);
        setAthletes(athleteRows);
        setSelectedAthlete((current) => current || athleteRows[0]?.id || "");
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        );
      } finally {
        setIsLoadingAthletes(false);
      }
    };

    void loadAthletes();
  }, [profile?.isCoach]);

  useEffect(() => {
    if (!selectedAthlete || !user) return;

    const loadWeeks = async () => {
      setIsFetchingWeeks(true);
      setError(null);

      try {
        const data = await getScheduleWeeksWithModules(selectedAthlete);
        setWeeks(data);
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        );
        setWeeks([]);
      } finally {
        setIsFetchingWeeks(false);
      }
    };

    void loadWeeks();
  }, [selectedAthlete, user]);

  const allModules = useMemo(
    () => weeks.flatMap((week) => week.days.flatMap((day) => day.modules)),
    [weeks],
  );

  const coverage = useMemo(() => computeCoverage(allModules), [allModules]);
  const weekStats = useMemo(
    () => weeks.map(toWeekStats).sort((a, b) => a.yearWeek - b.yearWeek),
    [weeks],
  );

  const overall = useMemo(() => aggregateLoggedModules(allModules), [allModules]);

  const selectedAthleteName = useMemo(() => {
    if (profile?.isCoach) {
      return athletes.find((athlete) => athlete.id === selectedAthlete)?.name ?? "Atlet";
    }

    return profile?.name ?? "Mig";
  }, [athletes, profile?.isCoach, profile?.name, selectedAthlete]);

  const hasData = weeks.length > 0 && allModules.length > 0;
  const isBusy = isLoading || isLoadingProfile || isLoadingAthletes || isFetchingWeeks;
  const completionRate =
    allModules.length > 0 ? Math.round((overall.loggedCount / allModules.length) * 100) : 0;

  if (isBusy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar statistik" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">
              Statistik
            </p>
            <h1 className="text-2xl font-semibold leading-tight">Traningens utveckling</h1>
            <p className="text-sm text-base-content/70">
              Visar veckor med tilldelat schema for {selectedAthleteName}.
            </p>
          </div>

          {profile?.isCoach && (
            <label className="form-control w-full max-w-xs">
              <div className="label py-1">
                <span className="label-text text-xs uppercase tracking-wide text-base-content/70">
                  Valj atlet
                </span>
              </div>
              <select
                className="select select-bordered select-sm"
                value={selectedAthlete}
                onChange={(event) => setSelectedAthlete(event.target.value)}
                disabled={athletes.length === 0}
              >
                <option value="" disabled>
                  {athletes.length === 0 ? "Inga atleter" : "Valj"}
                </option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {!hasData ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center">
            <p className="text-lg font-semibold">Inget att visa an</p>
            <p className="text-sm text-base-content/70">
              Vi hittar inga pass med inspelad feedback for de veckor som har delats ut.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="card border border-base-300 bg-base-200 shadow-sm">
                <div className="card-body gap-2">
                  <p className="text-xs uppercase tracking-wide text-base-content/70">
                    Pass med feedback
                  </p>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold">
                      {overall.loggedCount}/{allModules.length}
                    </span>
                    <span className="badge badge-outline badge-primary">
                      {completionRate}%
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary"
                    value={completionRate}
                    max={100}
                    aria-label="Feedbacktackning"
                  />
                </div>
              </div>

              <div className="card border border-base-300 bg-base-200 shadow-sm">
                <div className="card-body gap-2">
                  <p className="text-xs uppercase tracking-wide text-base-content/70">
                    Distans loggad
                  </p>
                  <p className="text-2xl font-semibold">{formatDistance(overall.distance)}</p>
                  <p className="text-xs text-base-content/70">
                    Summerar distans fran feedback i tilldelade pass.
                  </p>
                </div>
              </div>

              <div className="card border border-base-300 bg-base-200 shadow-sm">
                <div className="card-body gap-2">
                  <p className="text-xs uppercase tracking-wide text-base-content/70">
                    Tid loggad
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatDurationTotal(overall.duration)}
                  </p>
                  <p className="text-xs text-base-content/70">
                    Beraknar total tid med inspelad feedback.
                  </p>
                </div>
              </div>

              <div className="card border border-base-300 bg-base-200 shadow-sm">
                <div className="card-body gap-2">
                  <p className="text-xs uppercase tracking-wide text-base-content/70">
                    Snittvarden
                  </p>
                  <div className="flex items-baseline gap-3">
                    <div>
                      <p className="text-2xl font-semibold">
                        {formatAverage(overall.avgFeeling)}
                      </p>
                      <p className="text-xs text-base-content/70">Kansla</p>
                    </div>
                    <div className="divider divider-horizontal" />
                    <div>
                      <p className="text-2xl font-semibold">
                        {formatAverage(overall.avgSleep, " h")}
                      </p>
                      <p className="text-xs text-base-content/70">Sovtid</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border border-base-300 bg-base-200 shadow-sm">
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-base-content/70">
                      Datatackning
                    </p>
                    <h2 className="text-lg font-semibold">Falt dar feedback har sparats</h2>
                  </div>
                  <span className="text-sm text-base-content/70">
                    Totalt {coverage.total} pass tilldelade
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    [
                      ["distance", "Distans"],
                      ["duration", "Tid"],
                      ["weight", "Vikt"],
                      ["feeling", "Kansla"],
                      ["sleepHours", "Sovn"],
                      ["comment", "Kommentarer"],
                    ] as Array<[keyof DataCoverage, string]>
                  ).map(([key, label]) => {
                    const value = coverage[key];
                    const percent =
                      coverage.total > 0
                        ? Math.round((value / coverage.total) * 100)
                        : 0;

                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-base-300 bg-base-100 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{label}</p>
                          <span className="text-xs text-base-content/70">
                            {value}/{coverage.total}
                          </span>
                        </div>
                        <progress
                          className="progress progress-secondary"
                          value={percent}
                          max={100}
                          aria-label={`${label} datatackning`}
                        />
                        <p className="text-xs text-base-content/70">{percent}% av passen</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-base-content/70">
                    Vecka for vecka
                  </p>
                  <h2 className="text-lg font-semibold">Utveckling i respektive vecka</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {weekStats.map((week) => {
                  return (
                    <div
                      key={week.id}
                      className="rounded-2xl border border-base-300 bg-base-100 p-5 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Vecka {week.weekNumber}{week.year ? ` (${week.year})` : "" }
                          </p>
                          <h3 className="text-lg font-semibold">{week.label}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-base-content/70">Feedbacktackning</p>
                          <p className="text-xl font-semibold">{week.completionRate}%</p>
                        </div>
                      </div>

                      <progress
                        className="progress progress-primary"
                        value={week.completionRate}
                        max={100}
                        aria-label={`Feedbacktackning for vecka ${week.weekNumber}`}
                      />

                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Pass loggade
                          </p>
                          <p className="text-base font-semibold">
                            {week.loggedModules}/{week.assignedModules}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Distans
                          </p>
                          <p className="text-base font-semibold">
                            {formatDistance(week.distance)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Tid
                          </p>
                          <p className="text-base font-semibold">
                            {formatDurationTotal(week.duration)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Vikt
                          </p>
                          <p className="text-base font-semibold">
                            {formatWeight(week.weight)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Kansla
                          </p>
                          <p className="text-base font-semibold">
                            {formatAverage(week.avgFeeling)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Sovtid
                          </p>
                          <p className="text-base font-semibold">
                            {formatAverage(week.avgSleep, " h")}
                          </p>
                        </div>

                        <div className="rounded-xl border border-base-300 bg-base-200 p-3 sm:col-span-3">
                          <p className="text-xs uppercase tracking-wide text-base-content/70">
                            Kommentarer
                          </p>
                          <p className="text-base font-semibold">
                            {week.comments > 0 ? `${week.comments} st` : "Inga anteckningar"}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => goToWeekGraph(week)}
                        >
                          Visa grafer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
