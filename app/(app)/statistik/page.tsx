"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AreaChart } from "@tremor/react";

import { useAuth } from "@/components/auth-provider";

type SleepEntry = {
  date: string;
  sleepScore: number;
  dayRating: number;
};

type AthleteSleep = {
  id: string;
  name: string;
  entries: SleepEntry[];
};

const novemberDates = Array.from({ length: 30 }, (_, index) =>
  `2024-11-${String(index + 1).padStart(2, "0")}`,
);

const buildSleepEntries = (sleepScores: number[], dayRatings: number[]): SleepEntry[] =>
  novemberDates.map((date, index) => ({
    date,
    sleepScore: sleepScores[index] ?? 0,
    dayRating: dayRatings[index] ?? 0,
  }));

const athleteSleepData: AthleteSleep[] = [
  {
    id: "sara-svensson",
    name: "Sara Svensson",
    entries: buildSleepEntries(
      [
        8.4, 8.1, 8.3, 8.0, 8.2, 8.4, 8.1, 8.5, 8.7, 8.3,
        8.4, 8.6, 8.9, 9.1, 8.8, 9.0, 8.7, 8.6, 8.4, 8.5,
        8.3, 8.6, 8.8, 8.7, 8.9, 9.0, 9.1, 8.8, 8.6, 8.7,
      ],
      [
        7.8, 7.6, 7.4, 7.2, 7.5, 7.7, 7.9, 8.0, 7.8, 7.6,
        7.4, 7.8, 8.1, 8.3, 8.0, 8.2, 8.4, 8.1, 7.9, 7.8,
        8.0, 8.2, 8.4, 8.1, 8.0, 8.2, 8.4, 8.3, 8.1, 8.0,
      ],
    ),
  },
  {
    id: "leo-karlsson",
    name: "Leo Karlsson",
    entries: buildSleepEntries(
      [
        7.2, 7.4, 7.5, 7.3, 7.1, 7.2, 7.0, 7.4, 7.6, 7.3,
        7.1, 7.5, 7.6, 7.8, 7.4, 7.6, 7.2, 7.4, 7.5, 7.3,
        7.6, 7.8, 7.9, 7.6, 7.5, 7.7, 7.8, 7.9, 7.5, 7.6,
      ],
      [
        6.9, 6.8, 6.7, 6.5, 6.6, 6.8, 6.7, 6.9, 7.0, 6.8,
        6.6, 6.9, 7.1, 7.2, 7.0, 7.1, 6.9, 7.0, 7.1, 6.9,
        7.0, 7.2, 7.3, 7.1, 7.0, 7.1, 7.2, 7.3, 7.0, 7.1,
      ],
    ),
  },
  {
    id: "elin-backstrom",
    name: "Elin Bäckström",
    entries: buildSleepEntries(
      [
        8.8, 8.6, 8.7, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 8.7,
        8.9, 9.1, 9.2, 9.0, 8.8, 8.9, 9.1, 9.2, 9.0, 8.9,
        8.8, 8.9, 9.1, 9.2, 9.0, 9.1, 9.2, 9.3, 9.0, 9.1,
      ],
      [
        8.1, 8.0, 8.2, 8.1, 8.3, 8.4, 8.5, 8.6, 8.5, 8.3,
        8.2, 8.5, 8.7, 8.8, 8.6, 8.7, 8.8, 8.9, 8.7, 8.6,
        8.5, 8.6, 8.8, 8.9, 8.7, 8.8, 9.0, 9.1, 8.9, 8.8,
      ],
    ),
  },
];

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short", day: "numeric" }).format(
    new Date(date),
  );
}

export default function StatistikPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(
    athleteSleepData[0]?.id ?? "",
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

  const athlete = athleteSleepData.find((item) => item.id === selectedAthleteId);
  const chartData = useMemo(
    () =>
      (athlete?.entries ?? []).map((entry) => ({
        date: formatDateLabel(entry.date),
        sleepScore: entry.sleepScore,
        dayRating: entry.dayRating,
      })),
    [athlete],
  );
  const latestEntry = athlete?.entries.at(-1);

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner" aria-label="Laddar statistik" />
      </div>
    );
  }

  if (!user || !profile?.isCoach) {
    return null;
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-base-content/70">Insikter per atlet</p>
            <h1 className="text-2xl font-semibold">Statistik</h1>
          </div>

          <div className="flex w-full max-w-xs items-center gap-3">
            <label htmlFor="athlete" className="text-sm whitespace-nowrap">
              Välj atlet
            </label>
            <select
              id="athlete"
              className="select select-bordered select-sm flex-1"
              value={selectedAthleteId}
              onChange={(event) => setSelectedAthleteId(event.target.value)}
            >
              {athleteSleepData.map((athleteOption) => (
                <option key={athleteOption.id} value={athleteOption.id}>
                  {athleteOption.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-base-content/70">
                  Sömn- och dagskattning (1-10) visualiserade med Tremor area chart
                </p>
                <h2 className="text-xl font-semibold">{athlete?.name ?? "Ingen atlet"}</h2>
              </div>
              {latestEntry ? (
                <div className="rounded-box border border-base-300 bg-base-200 px-4 py-2 text-sm">
                  <p className="text-base-content/70">Senaste registrering</p>
                  <p className="font-semibold">
                    {formatDateLabel(latestEntry.date)} · Sömn {latestEntry.sleepScore.toFixed(1)} · Dag {latestEntry.dayRating.toFixed(1)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-4 text-sm text-base-content/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                  <span>Sömn</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-secondary" aria-hidden />
                  <span>Skattning av dag</span>
                </div>
              </div>
              <AreaChart
                className="h-[24rem]"
                data={chartData}
                index="date"
                categories={["sleepScore", "dayRating"]}
                colors={["indigo", "cyan"]}
                valueFormatter={(value) => value.toFixed(1)}
                yAxisLabel="Skattning (1-10)"
                xAxisLabel="Datum"
                minValue={0}
                maxValue={10}
                showLegend={false}
                curveType="natural"
                connectNulls
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
