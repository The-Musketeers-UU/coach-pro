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

const novemberLabels = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  return `${day} nov`;
});

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
      return { labels: novemberLabels, datasets: [] };
    }

    const datasets = [];

    if (visibleMetrics.sleep) {
      datasets.push({
        label: `${selectedAthlete.name} · sömnskattning`,
        data: selectedAthlete.sleepRatings,
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
        data: selectedAthlete.dayRatings,
        borderColor: selectedAthlete.dayColor,
        backgroundColor: "transparent",
        tension: 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [4, 4],
      });
    }

    return { labels: novemberLabels, datasets };
  }, [selectedAthlete, visibleMetrics.day, visibleMetrics.sleep]);

  const yAxisTitle = useMemo(() => {
    if (visibleMetrics.sleep && visibleMetrics.day) return "Skattning (sömn & dag)";
    if (visibleMetrics.sleep) return "Sömnskattning (1-10)";
    if (visibleMetrics.day) return "Dagskattning (1-10)";
    return "Ingen skattning vald";
  }, [visibleMetrics.day, visibleMetrics.sleep]);

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
              `${context.dataset.label}: ${context.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          min: 1,
          max: 10,
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
  }, [visibleMetrics.day, visibleMetrics.sleep, yAxisTitle]);

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
