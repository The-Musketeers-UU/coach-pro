"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const chartWidth = 960;
const chartHeight = 360;
const paddingX = 56;
const paddingY = 48;
const gradientId = "sleep-area-gradient";

type ChartPoint = {
  x: number;
  ySleep: number;
  yDay: number;
  sleepValue: number;
  dayValue: number;
  date: string;
};

type SleepAreaChartProps = { data: SleepEntry[] };

const toTimestamp = (date: string) => new Date(date).getTime();

function buildChartPoints(entries: SleepEntry[]): ChartPoint[] {
  if (entries.length === 0) return [];

  const sortedEntries = [...entries].sort(
    (a, b) => toTimestamp(a.date) - toTimestamp(b.date),
  );
  const minDate = toTimestamp(sortedEntries[0]?.date ?? "");
  const maxDate = toTimestamp(sortedEntries[sortedEntries.length - 1]?.date ?? "");
  const dateRange = Math.max(maxDate - minDate, 1);
  const maxValue = Math.max(
    10,
    Math.max(...sortedEntries.map((entry) => Math.max(entry.sleepScore, entry.dayRating))),
  );

  return sortedEntries.map((entry) => {
    const dateValue = toTimestamp(entry.date);
    const x =
      paddingX + ((dateValue - minDate) / dateRange) * (chartWidth - paddingX * 2);
    const ySleep =
      chartHeight -
      paddingY -
      (entry.sleepScore / maxValue) * (chartHeight - paddingY * 2);
    const yDay =
      chartHeight -
      paddingY -
      (entry.dayRating / maxValue) * (chartHeight - paddingY * 2);

    return {
      x,
      ySleep,
      yDay,
      sleepValue: entry.sleepScore,
      dayValue: entry.dayRating,
      date: entry.date,
    } satisfies ChartPoint;
  });
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("sv-SE", { month: "short", day: "numeric" }).format(
    new Date(date),
  );
}

function SleepAreaChart({ data }: SleepAreaChartProps) {
  const points = useMemo(() => buildChartPoints(data), [data]);
  const yMax = Math.max(
    10,
    Math.ceil(
      Math.max(
        ...data.map((entry) => Math.max(entry.sleepScore, entry.dayRating)),
        0,
      ),
    ),
  );
  const yTicks = [0, 2, 4, 6, 8, 10];

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-base-content/70">
        Ingen data att visa än.
      </div>
    );
  }

  const sleepLinePath = points
    .map(
      (point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.ySleep.toFixed(2)}`,
    )
    .join(" ");

  const dayLinePath = points
    .map(
      (point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.yDay.toFixed(2)}`,
    )
    .join(" ");

  const areaPath = `${sleepLinePath} L${points[points.length - 1]?.x.toFixed(2)},${
    chartHeight - paddingY
  } L${points[0]?.x.toFixed(2)},${chartHeight - paddingY} Z`;

  const visibleLabels = points.filter((_, index) => index % Math.ceil(points.length / 6 || 1) === 0);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      role="img"
      aria-label="Sömn- och dagskattning över tid"
      className="h-[24rem] w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--p))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(var(--p))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => {
        const y =
          chartHeight - paddingY - (tick / yMax) * (chartHeight - paddingY * 2);
        return (
          <g key={tick}>
            <line
              x1={paddingX}
              x2={chartWidth - paddingX}
              y1={y}
              y2={y}
              stroke="hsl(var(--bc)/0.1)"
              strokeWidth={1}
            />
            <text
              x={paddingX - 12}
              y={y + 4}
              className="fill-base-content/60 text-xs"
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={sleepLinePath} stroke="hsl(var(--p))" strokeWidth={3} fill="none" />
      <path
        d={dayLinePath}
        stroke="hsl(var(--s))"
        strokeWidth={2}
        strokeDasharray="6 6"
        fill="none"
      />

      {points.map((point) => (
        <g key={point.date}>
          <circle
            cx={point.x}
            cy={point.ySleep}
            r={5}
            fill="hsl(var(--p))"
            stroke="white"
            strokeWidth={2}
          />
          <circle
            cx={point.x}
            cy={point.yDay}
            r={4}
            fill="white"
            stroke="hsl(var(--s))"
            strokeWidth={2}
          />
        </g>
      ))}

      {visibleLabels.map((point) => (
        <text
          key={point.date}
          x={point.x}
          y={chartHeight - paddingY + 20}
          className="fill-base-content/70 text-xs"
          textAnchor="middle"
        >
          {formatDateLabel(point.date)}
        </text>
      ))}

      <text
        x={paddingX}
        y={paddingY - 16}
        className="fill-base-content text-sm font-semibold"
        textAnchor="start"
      >
        Skattning (1-10)
      </text>
      <text
        x={chartWidth - paddingX}
        y={chartHeight - paddingY + 24}
        className="fill-base-content text-sm font-semibold"
        textAnchor="end"
      >
        Datum
      </text>
    </svg>
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
  const chartData = athlete?.entries ?? [];
  const latestEntry = chartData.at(-1);

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
                  <span className="h-2 w-2 rounded-full border border-secondary" aria-hidden />
                  <span>Skattning av dag</span>
                </div>
              </div>
              <SleepAreaChart data={chartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
