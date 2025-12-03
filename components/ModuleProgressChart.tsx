"use client";

import { useMemo } from "react";

import type { AthletePerformanceSeries } from "@/lib/syntheticPerformance";

type ModuleProgressChartProps = {
  moduleTitle: string;
  series: AthletePerformanceSeries[];
};

type NumericPoint = {
  value: number;
  label: string;
  entryIndex: number;
};

const colors = [
  "#2563eb",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#6b21a8",
  "#0ea5e9",
];

const toNumericPoints = (entries: AthletePerformanceSeries["entries"]) =>
  entries
    .map((entry, entryIndex) => {
      const value = Number(entry.performance);
      if (!Number.isFinite(value)) return null;
      const dateLabel = new Date(entry.recordedAt).toLocaleDateString();
      return { value, label: dateLabel, entryIndex } satisfies NumericPoint;
    })
    .filter(Boolean) as NumericPoint[];

export function ModuleProgressChart({ moduleTitle, series }: ModuleProgressChartProps) {
  const prepared = useMemo(() => {
    const preparedSeries = series.map((item, index) => {
      const points = toNumericPoints(item.entries);
      return {
        ...item,
        color: colors[index % colors.length],
        points,
      };
    });

    const allValues = preparedSeries.flatMap((item) => item.points.map((point) => point.value));
    if (allValues.length === 0) {
      return {
        preparedSeries,
        allValues,
        yMin: 0,
        yMax: 1,
        maxPoints: 0,
        xLabels: [] as string[],
      };
    }

    const yMin = Math.min(...allValues);
    const yMax = Math.max(...allValues);
    const maxPoints = Math.max(...preparedSeries.map((item) => item.points.length));

    const labelSource =
      preparedSeries.reduce(
        (current, candidate) =>
          candidate.points.length > current.points.length ? candidate : current,
        { points: [] as NumericPoint[] },
      ) ?? null;

    const xLabels = labelSource?.points.map((point, index) => point.label || `Pass ${index + 1}`) ?? [];

    return {
      preparedSeries,
      allValues,
      yMin,
      yMax,
      maxPoints,
      xLabels,
    };
  }, [series]);

  if (prepared.allValues.length === 0) {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/70">
        Inga numeriska prestationer kunde visas ännu.
      </div>
    );
  }

  const width = 720;
  const height = 360;
  const padding = 48;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const xSpacing =
    prepared.maxPoints > 1 ? chartWidth / (prepared.maxPoints - 1) : chartWidth / 2;

  const yRange = Math.max(1, prepared.yMax - prepared.yMin);

  const toChartPoint = (value: number, index: number) => {
    const x = padding + (prepared.maxPoints > 1 ? index * xSpacing : xSpacing);
    const yRatio = (value - prepared.yMin) / yRange;
    const y = padding + (1 - yRatio) * chartHeight;
    return { x, y };
  };

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, index) => {
    const ratio = index / yTicks;
    const value = prepared.yMin + ratio * yRange;
    return Math.round(value);
  });

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-base-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral">Graf</p>
          <p className="text-base font-semibold text-base-content">
            Prestationskurva: {moduleTitle}
          </p>
          <p className="text-xs text-base-content/70">
            Numeriska prestationer per atlet över tid (syntetisk data).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {prepared.preparedSeries.map((item) => (
            <div
              key={item.athleteId}
              className="flex items-center gap-2 rounded-full border border-base-200 px-3 py-1 text-xs"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-semibold">{item.athleteName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Graf over prestationer for ${moduleTitle}`}
          className="w-full"
        >
          <rect
            x={padding}
            y={padding}
            width={chartWidth}
            height={chartHeight}
            className="fill-base-200"
            rx={8}
          />

          {yTickValues.map((tick, index) => {
            const yRatio = (tick - prepared.yMin) / yRange;
            const y = padding + (1 - yRatio) * chartHeight;
            return (
              <g key={tick} className="text-[10px]">
                <line
                  x1={padding}
                  x2={padding + chartWidth}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  className="text-base-300"
                  strokeDasharray="4 4"
                />
                <text x={padding - 8} y={y + 3} textAnchor="end" className="fill-current">
                  {tick}
                </text>
              </g>
            );
          })}

          {prepared.xLabels.map((label, index) => {
            const x =
              padding + (prepared.maxPoints > 1 ? index * xSpacing : xSpacing);
            return (
              <g key={`${label}-${index}`} className="text-[10px] text-base-content/70">
                <line
                  x1={x}
                  x2={x}
                  y1={padding + chartHeight}
                  y2={padding + chartHeight + 4}
                  stroke="currentColor"
                />
                <text
                  x={x}
                  y={padding + chartHeight + 14}
                  textAnchor="middle"
                  className="fill-current"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {prepared.preparedSeries.map((item) => {
            const polylinePoints = item.points
              .map((point, index) => {
                const { x, y } = toChartPoint(point.value, index);
                return `${x},${y}`;
              })
              .join(" ");

            return (
              <g key={item.athleteId}>
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {item.points.map((point, index) => {
                  const { x, y } = toChartPoint(point.value, index);
                  return (
                    <circle
                      key={`${item.athleteId}-${point.entryIndex}`}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={item.color}
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
