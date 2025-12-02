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
  color: string;
  sleepRatings: number[];
};

const novemberLabels = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  return `${day} nov`;
});

const athleteSleepData: AthleteSleepData[] = [
  {
    id: "elin-berg",
    name: "Elin Berg",
    color: "rgb(79, 70, 229)",
    sleepRatings: [
      7.5, 7.2, 7.8, 8.1, 7.9, 8.3, 7.6, 7.4, 8.0, 8.2,
      7.7, 7.9, 8.4, 8.1, 7.5, 7.8, 8.0, 8.3, 7.6, 7.4,
      7.9, 8.0, 8.2, 7.7, 7.5, 7.8, 8.1, 8.0, 7.6, 7.9,
    ],
  },
  {
    id: "amir-sjostrom",
    name: "Amir Sjöström",
    color: "rgb(14, 165, 233)",
    sleepRatings: [
      6.8, 7.0, 6.9, 7.2, 7.1, 7.4, 7.0, 6.7, 7.3, 7.1,
      6.9, 7.2, 7.4, 7.0, 6.8, 7.1, 7.3, 7.4, 7.0, 6.9,
      7.2, 7.3, 7.1, 6.8, 6.9, 7.2, 7.4, 7.1, 6.9, 7.0,
    ],
  },
  {
    id: "hanna-lind",
    name: "Hanna Lind",
    color: "rgb(52, 211, 153)",
    sleepRatings: [
      8.4, 8.2, 8.5, 8.6, 8.3, 8.7, 8.4, 8.2, 8.6, 8.5,
      8.3, 8.6, 8.8, 8.5, 8.2, 8.4, 8.7, 8.8, 8.5, 8.3,
      8.6, 8.7, 8.5, 8.2, 8.4, 8.6, 8.7, 8.5, 8.3, 8.6,
    ],
  },
];

export default function StatisticsPage() {
  const router = useRouter();
  const { user, profile, isLoading, isLoadingProfile } = useAuth();
  const [selectedAthleteId, setSelectedAthleteId] = useState(
    athleteSleepData[0]?.id ?? "",
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
    return {
      labels: novemberLabels,
      datasets: selectedAthlete
        ? [
            {
              label: `${selectedAthlete.name} · sömnskattning`,
              data: selectedAthlete.sleepRatings,
              borderColor: selectedAthlete.color,
              backgroundColor: `${selectedAthlete.color
                .replace("rgb", "rgba")
                .replace(")", ", 0.12)")}`,
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ]
        : [],
    };
  }, [selectedAthlete]);

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
              `Sömnskattning: ${context.formattedValue}`,
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
          suggestedMin: 5,
          suggestedMax: 10,
          ticks: {
            stepSize: 0.5,
          },
          title: {
            display: true,
            text: "Sömnskattning",
          },
        },
      },
    };
  }, []);

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
