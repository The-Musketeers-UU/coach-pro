const MILLISECONDS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

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
