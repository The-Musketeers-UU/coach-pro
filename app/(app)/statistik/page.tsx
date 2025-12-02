"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "@/components/auth-provider";

interface SleepMeasurement {
  date: string;
  sleep: number;
  label: string;
}

interface AthleteSleepSeries {
  id: string;
  name: string;
  measurements: SleepMeasurement[];
}

const buildMeasurements = (values: number[]): SleepMeasurement[] =>
  values.map((sleep, index) => {
    const day = index + 1;
    const dateLabel = new Date(`2024-11-${String(day).padStart(2, "0")}`)
      .toLocaleDateString("sv-SE", { day: "numeric", month: "short" })
      .replace(".", "");

    return {
      date: `2024-11-${String(day).padStart(2, "0")}`,
      sleep,
      label: dateLabel,
    };
  });

const sleepSeries: AthleteSleepSeries[] = [
  {
    id: "anna-andersson",
    name: "Anna Andersson",
    measurements: buildMeasurements([
      7.5,
      7.4,
      7.1,
      7.8,
      7.6,
      7.9,
      8.0,
      7.3,
      7.2,
      7.5,
      7.6,
      7.7,
      7.1,
      7.4,
      7.8,
      8.1,
      7.9,
      7.5,
      7.2,
      7.3,
      7.6,
      7.8,
      7.5,
      7.7,
      7.9,
      8.0,
      7.6,
      7.4,
      7.5,
      7.8,
    ]),
  },
  {
    id: "johan-larsson",
    name: "Johan Larsson",
    measurements: buildMeasurements([
      6.5,
      6.7,
      6.8,
      6.4,
      6.6,
      6.9,
      7.0,
      6.8,
      6.7,
      6.5,
      6.6,
      6.9,
      7.1,
      7.2,
      7.0,
      6.9,
      6.8,
      6.6,
      6.7,
      6.9,
      7.0,
      7.1,
      7.2,
      7.0,
      6.8,
      6.7,
      6.9,
      7.0,
      7.1,
      7.2,
    ]),
  },
];

const sleepTooltipFormatter = (value: number) => `${value.toFixed(1)} timmar`;

export default function StatistikPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    sleepSeries[0]?.id ?? "",
  );

  const selectedSeries = useMemo(
    () => sleepSeries.find((series) => series.id === selectedAthleteId),
    [selectedAthleteId],
  );

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/statistik");
      return;
    }

    if (!profile?.isCoach) {
      router.replace("/athlete");
    }
  }, [isLoading, isLoadingProfile, profile?.isCoach, router, user]);

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar statistik" />
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
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-base-content/70">Coachvy</p>
            <h1 className="text-2xl font-semibold">Statistik</h1>
            <p className="text-sm text-base-content/70">
              Dagliga skattningar av sömn för november 2024.
            </p>
          </div>

          <label className="form-control w-full max-w-xs">
            <span className="label-text text-sm font-medium">Välj atlet</span>
            <select
              className="select select-bordered"
              value={selectedAthleteId}
              onChange={(event) => setSelectedAthleteId(event.target.value)}
            >
              {sleepSeries.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="card-title text-lg">Sömn per dag (1–30 november)</h2>
                <p className="text-sm text-base-content/70">
                  Visar en mätning per dag med datum på x-axeln och skattad sömn i timmar på y-axeln.
                </p>
              </div>
            </div>

            <div className="mt-4 h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedSeries?.measurements ?? []}
                  margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    angle={-15}
                    height={50}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#d1d5db" }}
                    domain={[6, 8.5]}
                    tickCount={6}
                    label={{
                      value: "Sömn (timmar)",
                      angle: -90,
                      position: "insideLeft",
                      offset: -5,
                    }}
                  />
                  <Tooltip
                    formatter={sleepTooltipFormatter}
                    labelFormatter={(value) => `Datum: ${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
