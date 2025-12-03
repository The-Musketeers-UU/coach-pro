"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ModuleProgressChart } from "@/components/ModuleProgressChart";
import { getSyntheticModuleSeries } from "@/lib/syntheticPerformance";

type ModuleProgressPageProps = {
  params: { moduleId: string };
};

export default function ModuleProgressPage({ params }: ModuleProgressPageProps) {
  const searchParams = useSearchParams();
  const moduleSlug = params.moduleId;
  const moduleTitle =
    searchParams.get("title")?.trim() || moduleSlug.replace(/-/g, " ");

  const series = useMemo(
    () => getSyntheticModuleSeries(moduleSlug, moduleTitle),
    [moduleSlug, moduleTitle],
  );

  const summaries = useMemo(
    () =>
      series.map((athlete) => {
        const numeric = athlete.entries
          .map((entry) => Number(entry.performance))
          .filter((value) => Number.isFinite(value));

        const latest = athlete.entries.at(-1);
        const average =
          numeric.length > 0
            ? Math.round(
                numeric.reduce((total, value) => total + value, 0) / numeric.length,
              )
            : null;
        const best = numeric.length > 0 ? Math.max(...numeric) : null;

        return {
          athleteId: athlete.athleteId,
          athleteName: athlete.athleteName,
          latest,
          average,
          best,
          count: athlete.entries.length,
        };
      }),
    [series],
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-neutral">
              Modulprestation
            </p>
            <h1 className="text-2xl font-semibold text-base-content">
              {moduleTitle}
            </h1>
            <p className="text-sm text-base-content/70">
              Syntetiska demo-data som visar hur olika atleter presterar på samma
              modul. Grafen nedan går att nå direkt från modaldialogen i
              veckoschemat.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-outline btn-sm" href="/dashboard">
              Till coach-översikt
            </Link>
            <Link className="btn btn-outline btn-sm" href="/athlete">
              Till atletvy
            </Link>
          </div>
        </div>

        <ModuleProgressChart moduleTitle={moduleTitle} series={series} />

        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-base-200 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral">Översikt</p>
              <p className="text-sm text-base-content/70">
                Senaste och bästa registrering per atlet.
              </p>
            </div>
            <span className="badge badge-outline badge-sm">
              {series.length} atleter
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Athlete</th>
                  <th>Senaste värde</th>
                  <th>Bästa</th>
                  <th>Snitt</th>
                  <th>Antal registreringar</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary) => (
                  <tr key={summary.athleteId}>
                    <td className="font-semibold">{summary.athleteName}</td>
                    <td>
                      {summary.latest ? (
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {summary.latest.performance}
                          </span>
                          <span className="text-xs text-base-content/60">
                            {new Date(summary.latest.recordedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{summary.best ?? "-"}</td>
                    <td>{summary.average ?? "-"}</td>
                    <td>{summary.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
