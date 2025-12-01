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
  subCategory?: string;
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

  const modulesByDay = new Map<string, ModuleRow[]>();
  dayIds.forEach((dayId) => modulesByDay.set(dayId, []));

  moduleLinks.forEach((link) => {
    const linkedModule = modulesById.get(link.A);
    if (!linkedModule) return;

    const current = modulesByDay.get(link.B);
    if (current) {
      current.push(linkedModule);
    }
  });

  return scheduleDays.map((day) => ({
    ...day,
    modules: modulesByDay.get(day.id) ?? [],
  }));
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

  const weeksWithModules: ScheduleWeekWithModules[] = [];

  for (const week of weeks) {
    const days = await getScheduleDaysWithModules(week.id);
    weeksWithModules.push({
      ...week,
      days: fillMissingDays(week.id, days),
    });
  }

  return weeksWithModules;
};

export const createModule = async (input: CreateModuleInput): Promise<ModuleRow> => {
  const payload = {
    owner: input.ownerId,
    name: input.name,
    category: input.category,
    subCategory: input.subCategory?.trim() || null,
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

const findOrCreateScheduleDay = async (
  weekId: string,
  day: number,
): Promise<ScheduleDayRow> => {
  const [existingDay] = await supabaseRequest<ScheduleDayRow[]>("scheduleDay", {
    method: "GET",
    searchParams: {
      weekId: `eq.${weekId}`,
      day: `eq.${day}`,
      limit: "1",
    },
  });

  if (existingDay) return existingDay;

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
  const dayRow = await findOrCreateScheduleDay(input.weekId, input.day);

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
