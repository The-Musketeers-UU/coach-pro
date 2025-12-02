import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { supabaseRequest } from "./client";

export type ModuleRow = {
  id: string;
  owner: string;
  name: string;
  category: string;
  subCategory: string | null;
  distance: number | null;
  durationSeconds: number | null;
  durationMinutes: number | null;
  weight: number | null;
  description: string | null;
};

export const getModulesByOwner = async (ownerId: string): Promise<ModuleRow[]> =>
  supabaseRequest<ModuleRow[]>("module", {
    searchParams: {
      select: "id,owner,name,category,subCategory,distance,durationSeconds,durationMinutes,weight,description",
      owner: `eq.${ownerId}`,
      order: "name.asc",
    },
  });

export type ScheduleWeekRow = {
  id: string;
  owner: string;
  athlete: string;
  week: number;
};

type ScheduleDayRow = {
  id: string;
  day: number;
  weekId: string | null;
};

type ModuleScheduleDayRow = {
  A: string;
  B: string;
};

export type AthleteRow = {
  id: string;
  name: string;
  email: string;
  isCoach: boolean;
};

export type CreateUserInput = {
  name: string;
  email: string;
  isCoach?: boolean;
};

export type CreateModuleInput = {
  ownerId: string;
  name: string;
  category: string;
  subCategory?: string | string[];
  distance?: number;
  durationSeconds?: number;
  durationMinutes?: number;
  weight?: number;
  description?: string;
};

export type CreateScheduleWeekInput = {
  ownerId: string;
  athleteId: string;
  week: number;
};

export type AddModuleToScheduleDayInput = {
  moduleId: string;
  weekId: string;
  day: number;
};

export type GetScheduleWeekByWeekInput = {
  athleteId: string;
  week: number;
};

const sanitizeNumber = (value: number | undefined) =>
  Number.isFinite(value) ? Number(value) : undefined;

const buildInFilter = (values: string[]) =>
  `in.(${values.map((value) => `"${value}"`).join(",")})`;

export const getAthletes = async (): Promise<AthleteRow[]> =>
  supabaseRequest<AthleteRow[]>("user", {
    searchParams: {
      select: "id,name,email,isCoach",
      isCoach: "eq.false",
      order: "name.asc",
    },
  });

export const getCoaches = async (): Promise<AthleteRow[]> =>
  supabaseRequest<AthleteRow[]>("user", {
    searchParams: {
      select: "id,name,email,isCoach",
      isCoach: "eq.true",
      order: "name.asc",
    },
  });

export const getScheduleWeeksByAthlete = async (
  athleteId: string,
): Promise<ScheduleWeekRow[]> =>
  supabaseRequest<ScheduleWeekRow[]>("scheduleWeek", {
    searchParams: {
      select: "id,week,owner,athlete",
      athlete: `eq.${athleteId}`,
      order: "week.asc",
    },
  });

export type ScheduleDayWithModules = ScheduleDayRow & { modules: ModuleRow[] };

export type ScheduleWeekWithModules = ScheduleWeekRow & {
  days: ScheduleDayWithModules[];
};

const getScheduleDaysWithModules = async (
  weekId: string,
): Promise<ScheduleDayWithModules[]> => {
  const scheduleDays = await supabaseRequest<ScheduleDayRow[]>("scheduleDay", {
    searchParams: {
      select: "id,day,weekId",
      weekId: `eq.${weekId}`,
      order: "day.asc",
    },
  });

  if (scheduleDays.length === 0) return [];

  const dayIds = scheduleDays.map((day) => day.id);

  const moduleLinks = await supabaseRequest<ModuleScheduleDayRow[]>(
    "_ModuleToScheduleDay",
    {
      searchParams: {
        B: buildInFilter(dayIds),
      },
    },
  );

  if (moduleLinks.length === 0) {
    return scheduleDays.map((day) => ({ ...day, modules: [] }));
  }

  const moduleIds = Array.from(new Set(moduleLinks.map((link) => link.A)));

  const modules = await supabaseRequest<ModuleRow[]>("module", {
    searchParams: {
      id: buildInFilter(moduleIds),
    },
  });

  const modulesById = new Map(modules.map((module) => [module.id, module]));

  const modulesByDayId = new Map<string, ModuleRow[]>();
  dayIds.forEach((dayId) => modulesByDayId.set(dayId, []));

  moduleLinks.forEach((link) => {
    const linkedModule = modulesById.get(link.A);
    if (!linkedModule) return;

    const current = modulesByDayId.get(link.B);
    if (current) {
      current.push(linkedModule);
    }
  });

  const aggregatedByDay = new Map<number, ScheduleDayWithModules>();

  scheduleDays.forEach((day) => {
    const modulesForDay = modulesByDayId.get(day.id) ?? [];
    const existing = aggregatedByDay.get(day.day);

    if (existing) {
      existing.modules.push(...modulesForDay);
      return;
    }

    aggregatedByDay.set(day.day, {
      ...day,
      modules: [...modulesForDay],
    });
  });

  return Array.from(aggregatedByDay.values()).sort((a, b) => a.day - b.day);
};

const fillMissingDays = (weekId: string, days: ScheduleDayWithModules[]) => {
  const existing = new Map(days.map((day) => [day.day, day]));

  return Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    return (
      existing.get(dayNumber) ?? {
        id: `${weekId}-day-${dayNumber}`,
        day: dayNumber,
        weekId,
        modules: [],
      }
    );
  });
};

export const getScheduleWeeksWithModules = async (
  athleteId: string,
): Promise<ScheduleWeekWithModules[]> => {
  const weeks = await getScheduleWeeksByAthlete(athleteId);
  const seenWeeks = new Set<number>();
  const uniqueWeeks = weeks.filter((week) => {
    if (seenWeeks.has(week.week)) return false;
    seenWeeks.add(week.week);
    return true;
  });

  const weeksWithModules: ScheduleWeekWithModules[] = [];

  for (const week of uniqueWeeks) {
    const days = await getScheduleDaysWithModules(week.id);
    weeksWithModules.push({
      ...week,
      days: fillMissingDays(week.id, days),
    });
  }

  return weeksWithModules;
};

export const getScheduleWeekByAthleteAndWeek = async (
  input: GetScheduleWeekByWeekInput,
): Promise<ScheduleWeekRow | null> => {
  const existingWeeks = await supabaseRequest<ScheduleWeekRow[]>(
    "scheduleWeek",
    {
      searchParams: {
        select: "id,week,owner,athlete",
        athlete: `eq.${input.athleteId}`,
        week: `eq.${input.week}`,
        order: "id.asc",
      },
    },
  );

  if (existingWeeks.length > 1) {
    throw new Error(
      "Flera scheman finns redan för samma vecka. Rensa dubbletter innan du fortsätter.",
    );
  }

  return existingWeeks[0] ?? null;
};

const deleteScheduleLinksForDays = async (dayIds: string[]) => {
  if (dayIds.length === 0) return;

  await supabaseRequest("_ModuleToScheduleDay", {
    method: "DELETE",
    searchParams: {
      B: buildInFilter(dayIds),
    },
  });
};

const deleteScheduleDays = async (weekId: string, dayIds: string[]) => {
  if (dayIds.length === 0) return;

  await supabaseRequest("scheduleDay", {
    method: "DELETE",
    searchParams: {
      id: buildInFilter(dayIds),
      weekId: `eq.${weekId}`,
    },
  });
};

export const clearScheduleWeek = async (weekId: string): Promise<void> => {
  const existingDays = await supabaseRequest<ScheduleDayRow[]>("scheduleDay", {
    searchParams: {
      select: "id",
      weekId: `eq.${weekId}`,
    },
  });

  const dayIds = existingDays.map((day) => day.id);

  if (dayIds.length === 0) return;

  await deleteScheduleLinksForDays(dayIds);
  await deleteScheduleDays(weekId, dayIds);
};

export const getScheduleWeekWithModulesById = async (
  weekId: string,
): Promise<ScheduleWeekWithModules | null> => {
  const [week] = await supabaseRequest<ScheduleWeekRow[]>("scheduleWeek", {
    searchParams: {
      select: "id,week,owner,athlete",
      id: `eq.${weekId}`,
      limit: "1",
    },
  });

  if (!week) return null;

  const days = await getScheduleDaysWithModules(week.id);

  return {
    ...week,
    days: fillMissingDays(week.id, days),
  };
};

export const createModule = async (input: CreateModuleInput): Promise<ModuleRow> => {
  const normalizeSubCategory = (
    subCategory?: string | string[]
  ): string | null => {
    if (!subCategory) return null;

    const values = Array.isArray(subCategory) ? subCategory : [subCategory];
    const trimmed = values.map((value) => value.trim()).filter(Boolean);

    return trimmed.length ? trimmed.join(", ") : null;
  };

  const payload = {
    owner: input.ownerId,
    name: input.name,
    category: input.category,
    subCategory: normalizeSubCategory(input.subCategory),
    distance: sanitizeNumber(input.distance) ?? null,
    durationSeconds: sanitizeNumber(input.durationSeconds) ?? null,
    durationMinutes: sanitizeNumber(input.durationMinutes) ?? null,
    weight: sanitizeNumber(input.weight) ?? null,
    description: input.description?.trim() || null,
  } satisfies Omit<ModuleRow, "id">;

  const data = await supabaseRequest<ModuleRow[]>("module", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return data[0];
};

export const createScheduleWeek = async (
  input: CreateScheduleWeekInput,
): Promise<ScheduleWeekRow> => {
  const existingWeek = await getScheduleWeekByAthleteAndWeek({
    athleteId: input.athleteId,
    week: input.week,
  });

  if (existingWeek) {
    throw new Error("Ett schema för den här veckan finns redan för atleten.");
  }

  const payload = {
    owner: input.ownerId,
    athlete: input.athleteId,
    week: input.week,
  } satisfies Omit<ScheduleWeekRow, "id">;

  const data = await supabaseRequest<ScheduleWeekRow[]>("scheduleWeek", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return data[0];
};

const createScheduleDay = async (
  weekId: string,
  day: number,
): Promise<ScheduleDayRow> => {
  const [createdDay] = await supabaseRequest<ScheduleDayRow[]>("scheduleDay", {
    method: "POST",
    body: {
      weekId,
      day,
    },
    prefer: "return=representation",
  });

  return createdDay;
};

export const addModuleToScheduleDay = async (
  input: AddModuleToScheduleDayInput,
): Promise<{ day: ScheduleDayRow; link: ModuleScheduleDayRow }> => {
  const dayRow = await createScheduleDay(input.weekId, input.day);

  const [linkRow] = await supabaseRequest<ModuleScheduleDayRow[]>("_ModuleToScheduleDay", {
    method: "POST",
    body: {
      A: input.moduleId,
      B: dayRow.id,
    },
    prefer: "return=representation",
  });

  return { day: dayRow, link: linkRow };
};

export const createUser = async (input: CreateUserInput): Promise<AthleteRow> => {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    isCoach: Boolean(input.isCoach),
  } satisfies Omit<AthleteRow, "id">;

  const data = await supabaseRequest<AthleteRow[]>("user", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return data[0];
};

export const findUserByEmail = async (email: string): Promise<AthleteRow | null> => {
  const users = await supabaseRequest<AthleteRow[]>("user", {
    searchParams: {
      select: "id,name,email,isCoach",
      email: `eq.${email}`,
      limit: "1",
    },
  });

  return users[0] ?? null;
};

export const ensureUserForAuth = async (
  authUser: SupabaseAuthUser,
): Promise<AthleteRow> => {
  if (!authUser.email) {
    throw new Error("Authenticated user is missing an email.");
  }

  const existingUser = await findUserByEmail(authUser.email);
  if (existingUser) return existingUser;

  const nameFromMetadata =
    typeof authUser.user_metadata?.name === "string"
      ? authUser.user_metadata.name.trim()
      : "";

  const name = nameFromMetadata || authUser.email;
  const isCoach = Boolean(authUser.user_metadata?.isCoach);

  return createUser({
    email: authUser.email,
    name,
    isCoach,
  });
};
