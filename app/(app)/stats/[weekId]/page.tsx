"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { coerceYearWeekNumber } from "@/lib/week";
import {
  type ScheduleWeekWithModules,
  getScheduleWeekWithModulesById,
} from "@/lib/supabase/training-modules";

type ScheduleModule = ScheduleWeekWithModules["days"][number]["modules"][number];

type MetricKey = "distance" | "duration" | "weight" | "feeling" | "sleepHours";

type MetricOption = {
  key: MetricKey;
  label: string;
  formatter: (value: number) => string;
  help?: string;
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

const metricOptions: MetricOption[] = [
  { key: "distance", label: "Distans", formatter: formatDistance },
  { key: "duration", label: "Tid", formatter: formatDurationTotal, help: "Summerad feedback per dag" },
  { key: "weight", label: "Vikt", formatter: formatWeight },
  { key: "feeling", label: "Kansla", formatter: (value) => formatAverage(value) },
  { key: "sleepHours", label: "Sovtid", formatter: (value) => formatAverage(value, " h") },
];

const dayLabels = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

const getFeedbackMetricValue = (module: ScheduleModule, metric: MetricKey) => {
  if (!module.feedback) return null;

  const value = module.feedback[metric];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
};

const aggregateDayMetric = (modules: ScheduleModule[], metric: MetricKey) => {
  const values = modules
    .map((module) => getFeedbackMetricValue(module, metric))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return { value: 0, hasFeedback: false };
  }

  const sum = values.reduce((total, value) => total + value, 0);
  const useAverage = metric === "feeling" || metric === "sleepHours";

  return {
    value: useAverage ? sum / values.length : sum,
    hasFeedback: true,
  };
};

export default function WeekGraphPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoading, isLoadingProfile } = useAuth();
  const [week, setWeek] = useState<ScheduleWeekWithModules | null>(null);
  const [metric, setMetric] = useState<MetricKey>("distance");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekId = useMemo(() => {
    const raw = params?.weekId;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const weekInfo = useMemo(
    () => (week ? coerceYearWeekNumber(week.week) : null),
    [week],
  );
  const weekLabelNumber = weekInfo?.weekNumber ?? week?.week;
  const weekLabelYear = weekInfo?.year;

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/stats");
      return;
    }

    if (!weekId) return;

    const loadWeek = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const data = await getScheduleWeekWithModulesById(weekId);
        setWeek(data);
      } catch (supabaseError) {
        setError(
          supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
        );
      } finally {
        setIsFetching(false);
      }
    };

    void loadWeek();
  }, [isLoading, isLoadingProfile, router, user, weekId]);

  const dayData = useMemo(() => {
    if (!week) return [];

    return week.days.map((day) => {
      const { value, hasFeedback } = aggregateDayMetric(day.modules, metric);

      return {
        id: day.id,
        day: day.day,
        label: dayLabels[day.day - 1] ?? `Dag ${day.day}`,
        value,
        hasFeedback,
      };
    });
  }, [metric, week]);

  const maxValue = useMemo(() => {
    const values = dayData.map((day) => day.value);
    const max = Math.max(0, ...values);
    return max === 0 ? 1 : max;
  }, [dayData]);

  const selectedMetric = metricOptions.find((option) => option.key === metric)!;

  const handleBack = () => {
    const search = searchParams?.toString();
    router.push(`/stats${search ? `?${search}` : ""}`);
  };

  if (isLoading || isLoadingProfile || isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar grafer" />
      </div>
    );
  }

  if (!user) return null;

  if (!week) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-lg space-y-3 text-center">
          <p className="text-lg font-semibold">Ingen data hittades</p>
          <p className="text-sm text-base-content/70">
            Vi kunde inte ladda den valda veckan. Försök igen eller gå tillbaka till översikten.
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleBack}>
            Tillbaka till statistik
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-base-content/70">Vecka {weekLabelNumber}{weekLabelYear ? ` (${weekLabelYear})` : ""}</p>
            <h1 className="text-2xl font-semibold leading-tight">{week.title || `Vecka ${weekLabelNumber}`}</h1>
            <p className="text-sm text-base-content/70">Grafer över loggad feedback i veckan.</p>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={handleBack}>
              Tillbaka
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card border border-base-300 bg-base-200 shadow-sm">
          <div className="card-body space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-base-content/70">
                  Välj mått
                </p>
                <h2 className="text-lg font-semibold">{selectedMetric.label}</h2>
                {selectedMetric.help && (
                  <p className="text-xs text-base-content/70">{selectedMetric.help}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {metricOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`btn btn-sm ${metric === option.key ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setMetric(option.key)}
                    aria-pressed={metric === option.key}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-3 h-56 items-end">
                {dayData.map((day) => {
                  const heightPercent = Math.max(4, Math.round((day.value / maxValue) * 100));
                  return (
                    <div key={day.id} className="flex flex-col items-center gap-2">
                      <div className="w-full rounded-lg bg-primary/10 border border-primary/30 flex items-end justify-center">
                        <div
                          className="w-full rounded-lg bg-primary transition-all"
                          style={{ height: `${heightPercent}%` }}
                          aria-label={`${day.label}: ${selectedMetric.formatter(day.value)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold">{day.label.slice(0, 2)}</p>
                        <p className="text-xs text-base-content/70">
                          {day.hasFeedback ? selectedMetric.formatter(day.value) : "Ingen data"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-base-content/60">
                Staplarna summerar loggade värden per dag för valt mått. Tomma dagar saknar feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
