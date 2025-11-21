import { supabaseRequest } from "./client";

type ModuleRow = {
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

type ScheduleWeekRow = {
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
