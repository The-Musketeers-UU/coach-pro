import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type DbModuleRow = {
  id: number | string;
  owner: string;
  name: string;
  category: string;
  subCategory: string | null;
  distance: number | null;
  duration: number | null;
  weight: number | null;
  description: string | null;
  comment: string | null;
  feeling: number | null;
  sleepHours: number | null;
};

export type ModuleRow = DbModuleRow & { id: string };

const moduleSelectColumns =
  "id,owner,name,category,subCategory,distance,duration,weight,description,comment,feeling,sleepHours";

type DbScheduleModuleFeedbackRow = {
  id: number | string;
  moduleId: number | string;
  scheduleDayId: number | string;
  distance: number | null;
  duration: number | null;
  weight: number | null;
  comment: string | null;
  feeling: number | null;
  sleepHours: number | null;
};

export type ScheduleModuleFeedbackRow = DbScheduleModuleFeedbackRow & {
  id: string;
  moduleId: string;
  scheduleDayId: string;
};

type DbScheduleWeekRow = {
  id: number | string;
  owner: string;
  athlete: string;
  week: number;
  year: number;
  title: string;
};

export type ScheduleWeekRow = DbScheduleWeekRow & { id: string };

type DbScheduleDayRow = {
  id: number | string;
  day: number;
  weekId: number | string | null;
};

type ScheduleDayRow = {
  id: string;
  day: number;
  weekId: string | null;
};

type DbModuleScheduleDayRow = { A: string; B: number | string };

type ModuleScheduleDayRow = { moduleId: string; dayId: string };

type ScheduleDayModule = ModuleRow & {
  scheduleDayId: string;
  feedback?: ScheduleModuleFeedbackRow;
};

export type AthleteRow = {
  id: string;
  name: string;
  email: string;
  isCoach: boolean;
};

const toId = (value: number | string) => String(value);

const toIds = (values: Array<number | string>) => values.map((value) => toId(value));

const toDbNumericId = (value: number | string) => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Ogiltigt id-värde: ${String(value)}`);
  }

  return parsed;
};

const toDbNumericIds = (values: Array<number | string>) =>
  values.map((value) => toDbNumericId(value));

const coerceModuleRow = (row: DbModuleRow): ModuleRow => ({
  ...row,
  id: toId(row.id),
});

const coerceScheduleModuleFeedbackRow = (
  row: DbScheduleModuleFeedbackRow,
): ScheduleModuleFeedbackRow => ({
  ...row,
  id: toId(row.id),
  moduleId: toId(row.moduleId),
  scheduleDayId: toId(row.scheduleDayId),
});

const coerceScheduleWeekRow = (row: DbScheduleWeekRow): ScheduleWeekRow => ({
  ...row,
  id: toId(row.id),
});

const coerceScheduleDayRow = (row: DbScheduleDayRow): ScheduleDayRow => ({
  ...row,
  id: toId(row.id),
  weekId: row.weekId === null ? null : toId(row.weekId),
});

const coerceModuleLinkRow = (row: DbModuleScheduleDayRow): ModuleScheduleDayRow => ({
  moduleId: toId(row.A),
  dayId: toId(row.B),
});

const mergeModuleFeedback = (
  modulesByDayId: Map<string, ModuleRow[]>,
  feedbackRows: ScheduleModuleFeedbackRow[],
): Map<string, ScheduleDayModule[]> => {
  const feedbackByKey = new Map<string, ScheduleModuleFeedbackRow>();
  feedbackRows.forEach((row) => {
    feedbackByKey.set(`${row.scheduleDayId}:${row.moduleId}`, row);
  });

  const result = new Map<string, ScheduleDayModule[]>();

  modulesByDayId.forEach((modules, dayId) => {
    const enriched = modules.map((module) => {
      const feedback = feedbackByKey.get(`${dayId}:${module.id}`);
      return {
        ...module,
        scheduleDayId: dayId,
        feedback,
      } satisfies ScheduleDayModule;
    });

    result.set(dayId, enriched);
  });

  return result;
};

export const getModulesByOwner = async (ownerId: string): Promise<ModuleRow[]> => {
  try {
    const { data, error } = await supabase
      .from("module")
      .select(moduleSelectColumns)
      .eq("owner", ownerId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching modules by owner:", error);
      throw toReadableError(error);
    }

    return (data ?? []).map(coerceModuleRow);
  } catch (error) {
    console.error("Error retrieving modules via SQL query:", error);
    throw toReadableError(error);
  }
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
  distance?: number | null;
  duration?: number | null;
  weight?: number | null;
  description?: string;
  comment?: string | null;
  feeling?: number | null;
  sleepHours?: number | null;
};

export type CreateScheduleWeekInput = {
  ownerId: string;
  athleteId: string;
  week: number;
  year:number;
  title: string;
};

export type UpsertScheduleModuleFeedbackInput = {
  moduleId: string;
  scheduleDayId: string;
  distance: number | null;
  duration: number | null;
  weight: number | null;
  comment: string | null;
  feeling: number | null;
  sleepHours: number | null;
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

const sanitizeNumber = (value: number | null | undefined) =>
  Number.isFinite(value) ? Number(value) : undefined;

const formatSupabaseError = (error: unknown) => {
  if (!error) return "Okänt fel";

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object") {
    const maybeError = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };

    const parts = [maybeError.code, maybeError.message, maybeError.details, maybeError.hint].filter(Boolean);
    if (parts.length) {
      return parts.join(" | ");
    }
  }

  return String(error);
};

const toReadableError = (error: unknown) => new Error(formatSupabaseError(error));

export const getAthletes = async (): Promise<AthleteRow[]> => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("id,name,email,isCoach")
      .eq("isCoach", false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching athletes:", error);
      throw toReadableError(error);
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving athletes via SQL query:", error);
    throw toReadableError(error);
  }
};

export const getCoaches = async (): Promise<AthleteRow[]> => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("id,name,email,isCoach")
      .eq("isCoach", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching coaches:", error);
      throw toReadableError(error);
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving coaches via SQL query:", error);
    throw toReadableError(error);
  }
};

export const upsertScheduleModuleFeedback = async (
  input: UpsertScheduleModuleFeedbackInput,
): Promise<ScheduleModuleFeedbackRow> => {
  const payload = {
    moduleId: toDbNumericId(input.moduleId),
    scheduleDayId: toDbNumericId(input.scheduleDayId),
    distance: sanitizeNumber(input.distance) ?? null,
    duration: sanitizeNumber(input.duration) ?? null,
    weight: sanitizeNumber(input.weight) ?? null,
    comment: input.comment?.trim() || null,
    feeling: sanitizeNumber(input.feeling) ?? null,
    sleepHours: sanitizeNumber(input.sleepHours) ?? null,
  } satisfies Omit<DbScheduleModuleFeedbackRow, "id">;

  try {
    const { data, error } = await supabase
      .from("scheduleModuleFeedback")
      .upsert(payload, { onConflict: "moduleId,scheduleDayId" })
      .select(
        "id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours",
      )
      .single();

    if (error) {
      console.error("Error upserting schedule module feedback:", error);
      throw toReadableError(error);
    }

    return coerceScheduleModuleFeedbackRow({
      ...data,
      moduleId: data.moduleId ?? payload.moduleId,
      scheduleDayId: data.scheduleDayId ?? payload.scheduleDayId,
    } as DbScheduleModuleFeedbackRow);
  } catch (error) {
    console.error("Error persisting schedule module feedback via SQL query:", error);
    throw toReadableError(error);
  }
};

export const getScheduleWeeksByAthlete = async (
  athleteId: string,
): Promise<ScheduleWeekRow[]> => {
  try {
    const { data, error } = await supabase
      .from("scheduleWeek")
      .select("id,week,owner,athlete,title,year")
      .eq("athlete", athleteId)
      .order("week", { ascending: true });

    if (error) {
      console.error("Error fetching schedule weeks:", error);
      throw toReadableError(error);
    }

    return (data ?? []).map(coerceScheduleWeekRow);
  } catch (error) {
    console.error("Error retrieving schedule weeks via SQL query:", error);
    throw toReadableError(error);
  }
};

export type ScheduleDayWithModules = ScheduleDayRow & { modules: ScheduleDayModule[] };

export type ScheduleWeekWithModules = ScheduleWeekRow & {
  days: ScheduleDayWithModules[];
};

const getScheduleDaysWithModules = async (
  weekId: string,
): Promise<ScheduleDayWithModules[]> => {
  try {
    const { data: scheduleDays, error: scheduleDaysError } = await supabase
      .from("scheduleDay")
      .select("id,day,weekId")
      .eq("weekId", toDbNumericId(weekId))
      .order("day", { ascending: true });

    if (scheduleDaysError) {
      console.error("Error fetching schedule days:", scheduleDaysError);
      throw scheduleDaysError;
    }

    const days = (scheduleDays ?? []).map(coerceScheduleDayRow);
    if (days.length === 0) return [];

    const dayIds = days.map((day) => day.id);
    const dayIdsForQuery = toDbNumericIds(dayIds);

    const { data: moduleLinks, error: moduleLinksError } = await supabase
      .from("_ModuleToScheduleDay")
      .select("A,B")
      .in("B", dayIdsForQuery);

    if (moduleLinksError) {
      console.error("Error fetching module links for schedule days:", moduleLinksError);
      throw moduleLinksError;
    }

    const links = (moduleLinks ?? []).map(coerceModuleLinkRow);
    if (links.length === 0) {
      return days.map((day) => ({ ...day, modules: [] }));
    }

    const moduleIds = Array.from(new Set(links.map((link) => link.moduleId)));
    const moduleIdsForQuery = toDbNumericIds(moduleIds);

    const { data: modules, error: modulesError } = await supabase
      .from("module")
      .select(moduleSelectColumns)
      .in("id", moduleIdsForQuery);

    if (modulesError) {
      console.error("Error fetching modules for schedule days:", modulesError);
      throw modulesError;
    }

    const modulesList = (modules ?? []).map(coerceModuleRow);
    const modulesById = new Map(modulesList.map((module) => [module.id, module]));

    const modulesByDayId = new Map<string, ModuleRow[]>();
    dayIds.forEach((dayId) => modulesByDayId.set(dayId, []));

    links.forEach((link) => {
      const linkedModule = modulesById.get(link.moduleId);
      if (!linkedModule) return;

      const current = modulesByDayId.get(link.dayId);
      if (current) {
        current.push(linkedModule);
      }
    });

    const feedbackRows: ScheduleModuleFeedbackRow[] = [];

    if (dayIdsForQuery.length > 0) {
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("scheduleModuleFeedback")
        .select(
          "id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours",
        )
        .in("scheduleDayId", dayIdsForQuery);

      if (feedbackError) {
        console.error("Error fetching schedule module feedback:", feedbackError);
        throw feedbackError;
      }

      feedbackRows.push(...(feedbackData ?? []).map(coerceScheduleModuleFeedbackRow));
    }

    const modulesWithFeedbackByDay = mergeModuleFeedback(modulesByDayId, feedbackRows);

    const aggregatedByDay = new Map<number, ScheduleDayWithModules>();

    days.forEach((day) => {
      const modulesForDay = modulesWithFeedbackByDay.get(day.id) ?? [];
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
  } catch (error) {
    console.error("Error retrieving schedule days with modules via SQL query:", error);
    throw toReadableError(error);
  }
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

  if (uniqueWeeks.length === 0) {
    return [];
  }

  const weekIds = uniqueWeeks.map((week) => week.id);
  const weekIdsForQuery = toDbNumericIds(weekIds);
  const daysByWeek = new Map<string, Map<number, ScheduleDayWithModules>>();

  const { data: days, error: daysError } = await supabase
    .from("scheduleDay")
    .select("id,day,weekId")
    .in("weekId", weekIdsForQuery)
    .order("day", { ascending: true });

  if (daysError) {
    console.error("Error fetching schedule days:", daysError);
    throw daysError;
  }

  const dayRows = (days ?? []).map(coerceScheduleDayRow);
  const dayIds = dayRows.map((day) => day.id);
  const dayIdsForQuery = toDbNumericIds(dayIds);

  const links: ModuleScheduleDayRow[] = [];
  if (dayIdsForQuery.length > 0) {
    const { data: moduleLinks, error: moduleLinksError } = await supabase
      .from("_ModuleToScheduleDay")
      .select("A,B")
      .in("B", dayIdsForQuery);

    if (moduleLinksError) {
      console.error("Error fetching module links for schedule days:", moduleLinksError);
      throw moduleLinksError;
    }

    links.push(...(moduleLinks ?? []).map(coerceModuleLinkRow));
  }

  const moduleIds = Array.from(new Set(links.map((link) => link.moduleId)));

  const modulesList: ModuleRow[] = [];
  if (moduleIds.length > 0) {
    const moduleIdsForQuery = toDbNumericIds(moduleIds);

    const { data: modules, error: modulesError } = await supabase
      .from("module")
      .select(
        "id,owner,name,category,subCategory,distance,duration,weight,description,comment,feeling,sleepHours",
      )
      .in("id", moduleIdsForQuery);

    if (modulesError) {
      console.error("Error fetching modules for schedule days:", modulesError);
      throw modulesError;
    }

    modulesList.push(...(modules ?? []).map(coerceModuleRow));
  }
  const modulesById = new Map(modulesList.map((module) => [module.id, module]));
  const modulesByDayId = new Map<string, ModuleRow[]>();
  dayIds.forEach((dayId) => modulesByDayId.set(dayId, []));

  links.forEach((link) => {
    const linkedModule = modulesById.get(link.moduleId);
    if (!linkedModule) return;

    const current = modulesByDayId.get(link.dayId);
    if (current) {
      current.push(linkedModule);
    }
  });

  const feedbackRows: ScheduleModuleFeedbackRow[] = [];

  if (dayIdsForQuery.length > 0) {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("scheduleModuleFeedback")
      .select(
        "id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours",
      )
      .in("scheduleDayId", dayIdsForQuery);

    if (feedbackError) {
      console.error("Error fetching schedule module feedback:", feedbackError);
      throw feedbackError;
    }

    feedbackRows.push(...(feedbackData ?? []).map(coerceScheduleModuleFeedbackRow));
  }

  const modulesWithFeedbackByDay = mergeModuleFeedback(modulesByDayId, feedbackRows);

  dayRows.forEach((day) => {
    if (day.weekId === null) return;

    const weekId = day.weekId;
    if (!daysByWeek.has(weekId)) {
      daysByWeek.set(weekId, new Map());
    }

    const weekDays = daysByWeek.get(weekId)!;
    const modulesForDay = modulesWithFeedbackByDay.get(day.id) ?? [];
    const existingDay = weekDays.get(day.day);

    if (existingDay) {
      existingDay.modules.push(...modulesForDay);
      return;
    }

    weekDays.set(day.day, {
      ...day,
      modules: [...modulesForDay],
    });
  });

  return uniqueWeeks.map((week) => {
    const aggregatedDays = Array.from(daysByWeek.get(week.id)?.values() ?? []);
    return {
      ...week,
      days: fillMissingDays(week.id, aggregatedDays),
    };
  });
};

export const getScheduleWeekByAthleteAndWeek = async (
  input: GetScheduleWeekByWeekInput,
): Promise<ScheduleWeekRow | null> => {
  try {
    const { data, error } = await supabase
      .from("scheduleWeek")
      .select("id,week,owner,athlete,title,year")
      .eq("athlete", input.athleteId)
      .eq("week", input.week)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching schedule week by athlete and week:", error);
      throw toReadableError(error);
    }

    const existingWeeks = (data ?? []).map(coerceScheduleWeekRow);

    if (existingWeeks.length > 1) {
      throw new Error(
        "Flera scheman finns redan fAr samma vecka. Rensa dubbletter innan du fortsAtter.",
      );
    }

    return existingWeeks[0] ?? null;
  } catch (error) {
    console.error("Error retrieving schedule week via SQL query:", error);
    throw toReadableError(error);
  }
};

const deleteScheduleLinksForDays = async (dayIds: string[]) => {
  if (dayIds.length === 0) return;

  const numericDayIds = toDbNumericIds(dayIds);

  const { error } = await supabase
    .from("_ModuleToScheduleDay")
    .delete()
    .in("B", numericDayIds);

  if (error) {
    const message = formatSupabaseError(error);
    console.error("Error deleting module links for schedule days:", message);
    throw toReadableError(error);
  }
};

const deleteScheduleFeedbackForDays = async (dayIds: string[]) => {
  if (dayIds.length === 0) return;

  const numericDayIds = toDbNumericIds(dayIds);

  const { error } = await supabase
    .from("scheduleModuleFeedback")
    .delete()
    .in("scheduleDayId", numericDayIds);

  if (error) {
    const message = formatSupabaseError(error);
    console.error("Error deleting schedule module feedback for days:", message);
    throw toReadableError(error);
  }
};

const deleteScheduleDays = async (weekId: string, dayIds: string[]) => {
  if (dayIds.length === 0) return;

  const numericWeekId = toDbNumericId(weekId);
  const numericDayIds = toDbNumericIds(dayIds);

  const { error } = await supabase
    .from("scheduleDay")
    .delete()
    .in("id", numericDayIds)
    .eq("weekId", numericWeekId);

  if (error) {
    const message = formatSupabaseError(error);
    console.error("Error deleting schedule days:", message);
    throw toReadableError(error);
  }
};

export const clearScheduleWeek = async (weekId: string): Promise<void> => {
  try {
    const numericWeekId = toDbNumericId(weekId);

    const { data: existingDays, error } = await supabase
      .from("scheduleDay")
      .select("id")
      .eq("weekId", numericWeekId);

    if (error) {
      const message = formatSupabaseError(error);
      console.error("Error fetching schedule days to clear:", message);
      throw toReadableError(error);
    }

    const dayIds = toIds((existingDays ?? []).map((day) => day.id));
    if (dayIds.length === 0) return;

    await deleteScheduleFeedbackForDays(dayIds);
    await deleteScheduleLinksForDays(dayIds);
    await deleteScheduleDays(weekId, dayIds);
  } catch (error) {
    const message = formatSupabaseError(error);
    console.error("Error clearing schedule week via SQL query:", message);
    throw toReadableError(error);
  }
};

export const getScheduleWeekWithModulesById = async (
  weekId: string,
): Promise<ScheduleWeekWithModules | null> => {
  try {
    const { data: week, error } = await supabase
      .from("scheduleWeek")
      .select("id,week,owner,athlete,title,year")
      .eq("id", toDbNumericId(weekId))
      .maybeSingle();

    if (error) {
      console.error("Error fetching schedule week by id:", error);
      throw toReadableError(error);
    }

    if (!week) return null;

    const days = await getScheduleDaysWithModules(toId(week.id));

    const coercedWeek = coerceScheduleWeekRow(week);

    return {
      ...coercedWeek,
      days: fillMissingDays(coercedWeek.id, days),
    };
  } catch (error) {
    console.error("Error retrieving schedule week with modules via SQL query:", error);
    throw toReadableError(error);
  }
};

export const createModule = async (input: CreateModuleInput): Promise<ModuleRow> => {
  const payload = {
    owner: input.ownerId,
    name: input.name,
    category: input.category,
    subCategory: input.subCategory?.trim() || null,
    distance: sanitizeNumber(input.distance) ?? null,
    duration: sanitizeNumber(input.duration) ?? null,
    weight: sanitizeNumber(input.weight) ?? null,
    description: input.description?.trim() || null,
    comment: input.comment?.trim() || null,
    feeling: sanitizeNumber(input.feeling) ?? null,
    sleepHours: sanitizeNumber(input.sleepHours) ?? null,
  } satisfies Omit<ModuleRow, "id">;

  try {
    const { data, error } = await supabase.from("module").insert(payload).select().single();

    if (error) {
      console.error("ƒ?O Error adding a new module:", error);
      throw toReadableError(error);
    }

    return coerceModuleRow(data);
  } catch (error) {
    console.error("ƒ?O Error creating module:", error);
    throw toReadableError(error);
  }
};

export const createScheduleWeek = async (
  input: CreateScheduleWeekInput,
): Promise<ScheduleWeekRow> => {
  const title = input.title.trim() || `Vecka ${input.week}`;

  const existingWeek = await getScheduleWeekByAthleteAndWeek({
    athleteId: input.athleteId,
    week: input.week,
  });

  if (existingWeek) {
    throw new Error("Ett schema fAr den hAr veckan finns redan fAr atleten.");
  }

  const payload = {
    owner: input.ownerId,
    athlete: input.athleteId,
    week: input.week,
    year: input.year,
    title,
  } satisfies Omit<ScheduleWeekRow, "id">;

  try {
    const { data, error } = await supabase
      .from("scheduleWeek")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating schedule week:", error);
      throw toReadableError(error);
    }

    return coerceScheduleWeekRow(data);
  } catch (error) {
    console.error("Error persisting schedule week via SQL query:", error);
    throw toReadableError(error);
  }
};

export const updateScheduleWeek = async (
  weekId: string,
  updates: Partial<Pick<ScheduleWeekRow, "title">>,
): Promise<ScheduleWeekRow> => {
  const body = {
    ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
  } satisfies Partial<ScheduleWeekRow>;

  try {
    const numericWeekId = toDbNumericId(weekId);

    const { data, error } = await supabase
      .from("scheduleWeek")
      .update(body)
      .eq("id", numericWeekId)
      .select()
      .single();

    if (error) {
      console.error("Error updating schedule week:", error);
      throw toReadableError(error);
    }

    return coerceScheduleWeekRow(data);
  } catch (error) {
    console.error("Error persisting schedule week updates via SQL query:", error);
    throw toReadableError(error);
  }
};

const createScheduleDay = async (weekId: string, day: number): Promise<ScheduleDayRow> => {
  try {
    const numericWeekId = toDbNumericId(weekId);

    const { data: existingDay, error: existingError } = await supabase
      .from("scheduleDay")
      .select("id,day,weekId")
      .eq("weekId", numericWeekId)
      .eq("day", day)
      .order("id", { ascending: true })
      .limit(1);

    if (existingError) {
      console.error("Error checking for existing schedule day:", existingError);
      throw toReadableError(existingError);
    }

    const alreadyCreatedDay = existingDay?.[0];
    if (alreadyCreatedDay) {
      return coerceScheduleDayRow(alreadyCreatedDay);
    }

    const { data, error } = await supabase
      .from("scheduleDay")
      .insert({ weekId: numericWeekId, day })
      .select()
      .single();

    if (error) {
      console.error("Error creating schedule day:", error);
      throw toReadableError(error);
    }

    return coerceScheduleDayRow(data);
  } catch (error) {
    console.error("Error persisting schedule day via SQL query:", error);
    throw toReadableError(error);
  }
};

export const addModuleToScheduleDay = async (
  input: AddModuleToScheduleDayInput,
): Promise<{ day: ScheduleDayRow; link: ModuleScheduleDayRow }> => {
  const dayRow = await createScheduleDay(input.weekId, input.day);

  try {
    const { data: linkRow, error } = await supabase
      .from("_ModuleToScheduleDay")
      .insert({
        A: input.moduleId,
        B: toDbNumericId(dayRow.id),
      })
      .select()
      .single();

    if (error) {
      console.error("Error linking module to schedule day:", error);
      throw toReadableError(error);
    }

    return { day: dayRow, link: coerceModuleLinkRow(linkRow) };
  } catch (error) {
    console.error("Error persisting module link via SQL query:", error);
    throw toReadableError(error);
  }
};

export const createUser = async (input: CreateUserInput): Promise<AthleteRow> => {
  const payload = {
    name: input.name.trim(),
    email: input.email.trim(),
    isCoach: Boolean(input.isCoach),
  } satisfies Omit<AthleteRow, "id">;

  try {
    const { data, error } = await supabase.from("user").insert(payload).select().single();

    if (error) {
      console.error("Error creating user:", error);
      throw toReadableError(error);
    }

    return data;
  } catch (error) {
    console.error("Error persisting user via SQL query:", error);
    throw toReadableError(error);
  }
};

export const findUserByEmail = async (email: string): Promise<AthleteRow | null> => {
  console.log("Finding user by email:", email);

  try {
    const { data: user, error } = await supabase
      .from("user")
      .select("id,name,email,isCoach")
      .eq("email", email)
      .limit(1)
      .maybeSingle(); // Returns null if not found, throws on multiple results

    if (error) {
      console.error("ƒ?O Error finding user by email:", error);
      throw toReadableError(error);
    }

    console.log("ƒo. User found:", user);
    return user;
  } catch (error) {
    console.error("ƒ?O Error finding user by email:", error);
    throw toReadableError(error);
  }
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
