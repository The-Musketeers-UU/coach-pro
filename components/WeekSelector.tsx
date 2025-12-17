"use client";

import { useMemo } from "react";

import { formatIsoWeekMonthYear, getIsoWeekNumber } from "@/lib/week";

export type WeekOption = {
  value: string;
  label: string;
  weekNumber: number;
  startDate: Date;
};

const MILLISECONDS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

const getIsoWeekInfo = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

  const weekNumber =
    1 + Math.round((target.getTime() - firstThursday.getTime()) / MILLISECONDS_IN_WEEK);

  return { weekNumber, year: target.getUTCFullYear() } as const;
};

const getStartOfIsoWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

export const createRollingWeekOptions = (): WeekOption[] => {
  const today = new Date();
  const startOfCurrentWeek = getStartOfIsoWeek(today);
  const startDate = new Date(startOfCurrentWeek);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const endDate = new Date(startOfCurrentWeek);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const options: WeekOption[] = [];
  let currentWeekStart = startDate;

  while (currentWeekStart <= endDate) {
    const { weekNumber, year } = getIsoWeekInfo(currentWeekStart);
    const value = `${year}-W${weekNumber}`;
    const label = `Vecka ${weekNumber} (${year})`;

    options.push({
      value,
      label,
      weekNumber,
      startDate: new Date(currentWeekStart),
    });

    currentWeekStart = new Date(currentWeekStart.getTime() + MILLISECONDS_IN_WEEK);
  }

  return options;
};

export const getCurrentWeekValue = () => {
  const startOfCurrentWeek = getStartOfIsoWeek(new Date());
  const { weekNumber, year } = getIsoWeekInfo(startOfCurrentWeek);

  return `${year}-W${weekNumber}`;
};

export const parseWeekNumber = (value: string): number | null => {
  const match = /^\d{4}-W(\d{1,2})$/.exec(value);
  if (!match) return null;

  const week = Number(match[1]);
  return Number.isNaN(week) ? null : week;
};

export type WeekSelection = {
  activeWeekOption?: WeekOption;
  weekNumber: number;
  weekReferenceDate: Date;
  activeWeekIndex: number;
  isFirstSelectableWeek: boolean;
  isLastSelectableWeek: boolean;
};

export const getWeekSelection = ({
  weekOptions,
  selectedWeekValue,
  currentWeekValue,
}: {
  weekOptions: WeekOption[];
  selectedWeekValue: string;
  currentWeekValue: string;
}): WeekSelection => {
  const activeWeekOption =
    weekOptions.find((option) => option.value === selectedWeekValue) ??
    weekOptions.find((option) => option.value === currentWeekValue) ??
    weekOptions[0];

  const weekNumber =
    parseWeekNumber(activeWeekOption?.value ?? currentWeekValue) ??
    getIsoWeekNumber(new Date());

  const weekReferenceDate = activeWeekOption?.startDate ?? new Date();
  const activeWeekIndex = activeWeekOption
    ? weekOptions.findIndex((option) => option.value === activeWeekOption.value)
    : -1;
  const isFirstSelectableWeek = activeWeekIndex <= 0;
  const isLastSelectableWeek = activeWeekIndex === -1 || activeWeekIndex >= weekOptions.length - 1;

  return {
    activeWeekOption,
    weekNumber,
    weekReferenceDate,
    activeWeekIndex,
    isFirstSelectableWeek,
    isLastSelectableWeek,
  };
};

type WeekSelectorProps = {
  weekOptions: WeekOption[];
  selectedWeekValue: string;
  currentWeekValue: string;
  availableWeeks?: Set<number>;
  onChange: (value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function WeekSelector({
  weekOptions,
  selectedWeekValue,
  currentWeekValue,
  availableWeeks,
  onChange,
  onPrevious,
  onNext,
  className,
}: WeekSelectorProps) {
  const selection = useMemo(
    () => getWeekSelection({ weekOptions, selectedWeekValue, currentWeekValue }),
    [currentWeekValue, selectedWeekValue, weekOptions],
  );

  const containerClassName = ["flex w-full flex-col items-center gap-1 md:w-auto", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      <p className="text-md self-start text-left font-medium uppercase tracking-wide text-base-content/60">
        {formatIsoWeekMonthYear(selection.weekNumber, selection.weekReferenceDate)}
      </p>
      <div className="flex items-center gap-3">
        <button
          className="btn btn-outline btn-xs btn-primary"
          onClick={onPrevious}
          aria-label="Previous week"
          disabled={selection.isFirstSelectableWeek}
        >
          &lt;
        </button>

        <div className="flex flex-col items-center gap-1">
          <select
            className="select select-bordered select-sm min-w-[110px] uppercase tracking-wide"
            value={selection.activeWeekOption?.value ?? currentWeekValue}
            onChange={(event) => onChange(event.target.value)}
          >
            {weekOptions.map((weekOption) => {
              const hasSchedule = availableWeeks?.has(weekOption.weekNumber);

              return (
                <option
                  key={weekOption.value}
                  value={weekOption.value}
                  className={
                    hasSchedule === false
                      ? "text-base-content/50"
                      : "text-base-content"
                  }
                >
                  {weekOption.label}
                </option>
              );
            })}
          </select>
        </div>

        <button
          className="btn btn-outline btn-xs btn-primary"
          onClick={onNext}
          aria-label="Next week"
          disabled={selection.isLastSelectableWeek}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
