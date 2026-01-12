const MILLISECONDS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

const getStartDateOfIsoWeek = (weekNumber: number, year: number) => {
  const fourthOfJanuary = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = fourthOfJanuary.getUTCDay() || 7;
  const startOfWeek = new Date(fourthOfJanuary);

  startOfWeek.setUTCDate(fourthOfJanuary.getUTCDate() - dayOfWeek + 1);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() + (weekNumber - 1) * 7);

  return startOfWeek;
};

const resolveIsoWeekYear = (weekNumber: number, referenceDate = new Date()) => {
  const currentYear = referenceDate.getFullYear();
  const currentWeek = getIsoWeekNumber(referenceDate);

  if (weekNumber >= currentWeek + 26) return currentYear - 1;
  if (weekNumber <= currentWeek - 26) return currentYear + 1;

  return currentYear;
};

export const getIsoWeekNumber = (date: Date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstThursdayDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNumber + 3);

  const weekNumber = 1 + Math.round((target.getTime() - firstThursday.getTime()) / MILLISECONDS_IN_WEEK);
  
  const isoYear = target.getUTCFullYear();
  
  // Return combined year+week format (e.g., 202634)
  return parseInt(`${isoYear}${weekNumber.toString().padStart(2, '0')}`);
};

export const getDateRangeForIsoWeek = (
  weekNumber: number,
  referenceDate = new Date(),
) => {
  const isoYear = resolveIsoWeekYear(weekNumber, referenceDate);
  const start = getStartDateOfIsoWeek(weekNumber, isoYear);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return { start, end, isoYear } as const;
};

export const formatIsoWeekDateRange = (
  weekNumber: number,
  referenceDate = new Date(),
) => {
  const { start, end, isoYear } = getDateRangeForIsoWeek(weekNumber, referenceDate);
  const dayMonthFormatter = new Intl.DateTimeFormat("sv-SE", {
    month: "short",
    day: "numeric",
  });
  const yearFormatter = new Intl.DateTimeFormat("sv-SE", { year: "numeric" });

  return `${dayMonthFormatter.format(start)} – ${dayMonthFormatter.format(end)} ${yearFormatter.format(
    new Date(Date.UTC(isoYear, 0, 1)),
  )}`;
};

export const formatIsoWeekMonthYear = (
  weekNumber: number,
  referenceDate = new Date(),
) => {
  const { start, isoYear } = getDateRangeForIsoWeek(weekNumber, referenceDate);
  const monthYearFormatter = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
  });

  return monthYearFormatter.format(
    new Date(Date.UTC(isoYear, start.getUTCMonth(), start.getUTCDate())),
  );
};

export { getStartDateOfIsoWeek, resolveIsoWeekYear };

export const findClosestWeekIndex = (
  weeks: { week: number }[],
  targetWeek: number,
) => {
  if (weeks.length === 0) return 0;

  const exactIndex = weeks.findIndex((week) => week.week === targetWeek);
  if (exactIndex !== -1) return exactIndex;

  const upcomingIndex = weeks.findIndex((week) => week.week > targetWeek);
  if (upcomingIndex !== -1) return upcomingIndex;

  return weeks.length - 1;
};
