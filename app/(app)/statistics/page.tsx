"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { useAuth } from "@/components/auth-provider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type AthleteSleepData = {
  id: string;
  name: string;
  sleepColor: string;
  dayColor: string;
  sleepRatings: number[];
  dayRatings: number[];
};

const athleteSleepData: AthleteSleepData[] = [
  {
    id: "elin-berg",
    name: "Elin Berg",
    sleepColor: "rgb(79, 70, 229)",
    dayColor: "rgb(249, 115, 22)",
    sleepRatings: [
      8, 7, 9, 6, 8, 7, 10, 9, 5, 6,
      8, 7, 9, 8, 6, 7, 9, 10, 8, 6,
      7, 9, 8, 5, 6, 8, 9, 7, 8, 6,
    ],
    dayRatings: [
      6, 5, 7, 8, 6, 7, 5, 6, 8, 9,
      7, 6, 5, 7, 8, 9, 6, 5, 7, 8,
      6, 7, 5, 6, 8, 9, 7, 6, 5, 7,
    ],
  },
  {
    id: "amir-sjostrom",
    name: "Amir Sjöström",
    sleepColor: "rgb(14, 165, 233)",
    dayColor: "rgb(16, 185, 129)",
    sleepRatings: [
      5, 6, 7, 8, 7, 6, 5, 9, 8, 7,
      6, 5, 7, 8, 9, 6, 5, 7, 8, 9,
      6, 5, 7, 8, 9, 6, 5, 7, 8, 9,
    ],
    dayRatings: [
      9, 8, 6, 5, 7, 8, 6, 5, 7, 8,
      9, 7, 6, 5, 7, 8, 9, 7, 6, 5,
      7, 8, 6, 5, 7, 8, 9, 7, 6, 5,
    ],
  },
  {
    id: "hanna-lind",
    name: "Hanna Lind",
    sleepColor: "rgb(52, 211, 153)",
    dayColor: "rgb(239, 68, 68)",
    sleepRatings: [
      10, 9, 8, 7, 6, 8, 9, 10, 7, 6,
      8, 9, 10, 7, 6, 5, 9, 8, 7, 6,
      8, 9, 10, 7, 6, 5, 8, 9, 10, 7,
    ],
    dayRatings: [
      4, 6, 5, 7, 8, 6, 5, 4, 6, 5,
      7, 8, 6, 5, 4, 6, 7, 8, 6, 5,
      4, 6, 7, 8, 6, 5, 4, 6, 7, 8,
    ],
  },
];

type VisibleMetrics = {
  sleep: boolean;
  day: boolean;
};

export default function StatisticsPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    athleteSleepData[0]?.id ?? "",
  );
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    sleep: true,
    day: true,
  });
  const [xAxisMetric, setXAxisMetric] = useState<"date" | "sleep" | "day">(
    "date",
  );

  useEffect(() => {
    if (isLoading || isLoadingProfile) return;

    if (!user) {
      router.replace("/login?redirectTo=/statistics");
      return;
    }

    if (!profile?.isCoach) {
      router.replace("/athlete");
    }
  }, [isLoading, isLoadingProfile, profile?.isCoach, router, user]);

  const selectedAthlete = useMemo(
    () => athleteSleepData.find((athlete) => athlete.id === selectedAthleteId),
    [selectedAthleteId],
  );

  const chartData = useMemo(() => {
    if (!selectedAthlete) {
      return { datasets: [] };
    }

    const getXAxisValue = (index: number) => {
      if (xAxisMetric === "date") return index + 1;
      if (xAxisMetric === "sleep") return selectedAthlete.sleepRatings[index];
      return selectedAthlete.dayRatings[index];
    };

    const datasets = [] as {
      label: string;
      data: { x: number; y: number }[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      fill?: boolean;
      pointRadius?: number;
      pointHoverRadius?: number;
      borderDash?: number[];
    }[];

    if (visibleMetrics.sleep) {
      datasets.push({
        label: `${selectedAthlete.name} · sömnskattning`,
        data: selectedAthlete.sleepRatings.map((sleepRating, index) => ({
          x: getXAxisValue(index),
          y: sleepRating,
        })),
        borderColor: selectedAthlete.sleepColor,
        backgroundColor: `${selectedAthlete.sleepColor
          .replace("rgb", "rgba")
          .replace(")", ", 0.12)")}`,
        tension: 0,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      });
    }

    if (visibleMetrics.day) {
      datasets.push({
        label: `${selectedAthlete.name} · dagskattning`,
        data: selectedAthlete.dayRatings.map((dayRating, index) => ({
          x: getXAxisValue(index),
          y: dayRating,
        })),
        borderColor: selectedAthlete.dayColor,
        backgroundColor: "transparent",
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [4, 4],
      });
    }

    return { datasets };
  }, [selectedAthlete, visibleMetrics.day, visibleMetrics.sleep, xAxisMetric]);

  const xAxisTitle = useMemo(() => {
    if (xAxisMetric === "date") return "Datum (dag i november)";
    if (xAxisMetric === "sleep") return "Sömnskattning (1-10)";
    return "Dagskattning (1-10)";
  }, [xAxisMetric]);

  const { xMin, xMax } = useMemo(() => {
    if (xAxisMetric === "date") {
      return { xMin: 1, xMax: 30 };
    }

    return { xMin: 1, xMax: 10 };
  }, [xAxisMetric]);

  const yAxisTitle = useMemo(() => {
    if (visibleMetrics.sleep && visibleMetrics.day) return "Skattning (sömn & dag)";
    if (visibleMetrics.sleep) return "Sömnskattning (1-10)";
    if (visibleMetrics.day) return "Dagskattning (1-10)";
    return "Ingen skattning vald";
  }, [visibleMetrics.day, visibleMetrics.sleep]);

  const { yMin, yMax } = useMemo(() => ({ yMin: 1, yMax: 10 }), []);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<"line">) =>
              `${context.dataset.label}: (x: ${context.parsed.x}, y: ${context.formattedValue})`,
          },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: xMin,
          max: xMax,
          title: {
            display: true,
            text: `X-axel: ${xAxisTitle}`,
          },
          ticks: {
            stepSize: 1,
          },
          grid: {
            display: false,
          },
        },
        y: {
          min: yMin,
          max: yMax,
          ticks: {
            stepSize: 1,
          },
          title: {
            display: visibleMetrics.day || visibleMetrics.sleep,
            text: yAxisTitle,
          },
        },
      },
    };
  }, [visibleMetrics.day, visibleMetrics.sleep, xAxisTitle, xMax, xMin, yAxisTitle, yMax, yMin]);

  const handleToggleMetric = (metric: keyof VisibleMetrics) => {
    setVisibleMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
  };

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
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-base-content/70">
                Statistik
              </p>
            <h1 className="text-2xl font-semibold text-base-content">
              Sömnskattning november
            </h1>
            <p className="text-base-content/70">
              Visa dagliga skattningar för valda atleter i november. Datan är
              frikopplad från databasen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm" htmlFor="athlete-select">
              Välj atlet
            </label>
            <select
              id="athlete-select"
              className="select select-bordered select-sm min-w-52"
              value={selectedAthleteId}
              onChange={(event) => setSelectedAthleteId(event.target.value)}
            >
              {athleteSleepData.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-base-content/70" htmlFor="x-axis-select">
              X-axel data
            </label>
            <select
              id="x-axis-select"
              className="select select-bordered select-sm"
              value={xAxisMetric}
              onChange={(event) => setXAxisMetric(event.target.value as "date" | "sleep" | "day")}
            >
              <option value="date">Datum</option>
              <option value="sleep">Sömnskattning</option>
              <option value="day">Skattning av dag</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-base-content/70">Visa på y-axel:</span>
            <label className="label cursor-pointer gap-2">
              <span className="text-sm">Sömn</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleMetrics.sleep}
                onChange={() => handleToggleMetric("sleep")}
              />
            </label>
            <label className="label cursor-pointer gap-2">
              <span className="text-sm">Dag</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleMetrics.day}
                onChange={() => handleToggleMetric("day")}
              />
            </label>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">Dagliga skattningar</h2>
              <p className="text-sm text-base-content/70">November 2024</p>
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
