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
  runColor: string;
  sleepRatings: number[];
  dayRatings: number[];
  runningTimes: number[];
};

const athleteSleepData: AthleteSleepData[] = [
  {
    id: "elin-berg",
    name: "Elin Berg",
    sleepColor: "rgb(79, 70, 229)",
    dayColor: "rgb(249, 115, 22)",
    runColor: "rgb(34, 197, 94)",
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
    runningTimes: [
      42, 45, 39, 50, 47, 44, 41, 53, 48, 46,
      43, 49, 37, 52, 45, 47, 40, 55, 44, 46,
      42, 51, 43, 49, 38, 54, 46, 48, 41, 50,
    ],
  },
  {
    id: "amir-sjostrom",
    name: "Amir Sjöström",
    sleepColor: "rgb(14, 165, 233)",
    dayColor: "rgb(16, 185, 129)",
    runColor: "rgb(220, 38, 38)",
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
    runningTimes: [
      55, 52, 58, 50, 57, 54, 60, 53, 49, 56,
      59, 51, 57, 54, 61, 52, 58, 50, 55, 57,
      53, 59, 52, 56, 60, 54, 58, 51, 57, 55,
    ],
  },
  {
    id: "hanna-lind",
    name: "Hanna Lind",
    sleepColor: "rgb(52, 211, 153)",
    dayColor: "rgb(239, 68, 68)",
    runColor: "rgb(2, 132, 199)",
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
    runningTimes: [
      48, 46, 50, 44, 52, 47, 45, 49, 43, 51,
      46, 54, 42, 50, 45, 53, 44, 52, 47, 49,
      43, 50, 46, 52, 44, 51, 45, 53, 47, 49,
    ],
  },
];

type VisibleMetrics = {
  sleep: boolean;
  day: boolean;
  run: boolean;
};

type AxisMetric = "date" | "sleep" | "day" | "run";

export default function StatisticsPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    athleteSleepData[0]?.id ?? "",
  );
  const [visibleMetrics, setVisibleMetrics] = useState<VisibleMetrics>({
    sleep: true,
    day: true,
    run: false,
  });
  const [xAxisMetric, setXAxisMetric] = useState<AxisMetric>("date");
  const [yAxisMetric, setYAxisMetric] = useState<AxisMetric>("sleep");

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

    const getMetricValue = (metric: AxisMetric, index: number) => {
      if (metric === "date") return index + 1;
      if (metric === "sleep") return selectedAthlete.sleepRatings[index];
      if (metric === "day") return selectedAthlete.dayRatings[index];
      return selectedAthlete.runningTimes[index];
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
        data: selectedAthlete.sleepRatings.map((_, index) => ({
          x: getMetricValue(xAxisMetric, index),
          y: getMetricValue(yAxisMetric, index),
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
        data: selectedAthlete.dayRatings.map((_, index) => ({
          x: getMetricValue(xAxisMetric, index),
          y: getMetricValue(yAxisMetric, index),
        })),
        borderColor: selectedAthlete.dayColor,
        backgroundColor: "transparent",
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [4, 4],
      });
    }

    if (visibleMetrics.run) {
      datasets.push({
        label: `${selectedAthlete.name} · löpartid`,
        data: selectedAthlete.runningTimes.map((_, index) => ({
          x: getMetricValue(xAxisMetric, index),
          y: getMetricValue(yAxisMetric, index),
        })),
        borderColor: selectedAthlete.runColor,
        backgroundColor: `${selectedAthlete.runColor
          .replace("rgb", "rgba")
          .replace(")", ", 0.12)")}`,
        tension: 0,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [2, 6],
      });
    }

    return { datasets };
  }, [selectedAthlete, visibleMetrics.day, visibleMetrics.run, visibleMetrics.sleep, xAxisMetric, yAxisMetric]);

  const xAxisTitle = useMemo(() => {
    if (xAxisMetric === "date") return "Datum (dag i november)";
    if (xAxisMetric === "sleep") return "Sömnskattning (1-10)";
    if (xAxisMetric === "day") return "Dagskattning (1-10)";
    return "Löpartid (minuter)";
  }, [xAxisMetric]);

  const yAxisTitle = useMemo(() => {
    if (yAxisMetric === "date") return "Datum (dag i november)";
    if (yAxisMetric === "sleep") return "Sömnskattning (1-10)";
    if (yAxisMetric === "day") return "Dagskattning (1-10)";
    return "Löpartid (minuter)";
  }, [yAxisMetric]);

  const { xMin, xMax } = useMemo(() => {
    if (xAxisMetric === "date") return { xMin: 1, xMax: 30 };
    if (xAxisMetric === "run") return { xMin: 35, xMax: 65 };

    return { xMin: 1, xMax: 10 };
  }, [xAxisMetric]);

  const { yMin, yMax } = useMemo(() => {
    if (yAxisMetric === "date") return { yMin: 1, yMax: 30 };
    if (yAxisMetric === "run") return { yMin: 35, yMax: 65 };

    return { yMin: 1, yMax: 10 };
  }, [yAxisMetric]);

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
              `${context.dataset.label}: (x: ${context.parsed.x}, y: ${context.parsed.y})`,
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
            display: true,
            text: yAxisTitle,
          },
        },
      },
    };
  }, [xAxisTitle, xMax, xMin, yAxisTitle, yMax, yMin]);

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

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70" htmlFor="x-axis-select">
                X-axel
              </label>
              <select
                id="x-axis-select"
                className="select select-bordered select-sm"
                value={xAxisMetric}
                onChange={(event) => setXAxisMetric(event.target.value as AxisMetric)}
              >
                <option value="date">Datum</option>
                <option value="sleep">Sömnskattning</option>
                <option value="day">Skattning av dag</option>
                <option value="run">Löpartid</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-base-content/70" htmlFor="y-axis-select">
                Y-axel
              </label>
              <select
                id="y-axis-select"
                className="select select-bordered select-sm"
                value={yAxisMetric}
                onChange={(event) => setYAxisMetric(event.target.value as AxisMetric)}
              >
                <option value="date">Datum</option>
                <option value="sleep">Sömnskattning</option>
                <option value="day">Skattning av dag</option>
                <option value="run">Löpartid</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-base-content/70">Visa linjer:</span>
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
            <label className="label cursor-pointer gap-2">
              <span className="text-sm">Löpartid</span>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={visibleMetrics.run}
                onChange={() => handleToggleMetric("run")}
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
