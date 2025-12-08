import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export type ModuleRow = {
  id: string;
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

export const getModulesByOwner = async (ownerId: string): Promise<ModuleRow[]> => {
  try {
    const { data, error } = await supabase
      .from("module")
      .select(
        "id,owner,name,category,subCategory,distance,duration,weight,description,comment,feeling,sleepHours",
      )
      .eq("owner", ownerId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching modules by owner:", error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving modules via SQL query:", error);
    throw error;
  }
};

export type ScheduleWeekRow = {
  id: string;
  owner: string;
  athlete: string;
  week: number;
  title: string;
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
  duration?: number;
  weight?: number;
  description?: string;
  comment?: string;
  feeling?: number;
  sleepHours?: number;
};

export type CreateScheduleWeekInput = {
  ownerId: string;
  athleteId: string;
  week: number;
  title: string;
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

export const getAthletes = async (): Promise<AthleteRow[]> => {
  try {
    const { data, error } = await supabase
      .from("user")
      .select("id,name,email,isCoach")
      .eq("isCoach", false)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching athletes:", error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving athletes via SQL query:", error);
    throw error;
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
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving coaches via SQL query:", error);
    throw error;
  }
};

export const getScheduleWeeksByAthlete = async (
  athleteId: string,
): Promise<ScheduleWeekRow[]> => {
  try {
    const { data, error } = await supabase
      .from("scheduleWeek")
      .select("id,week,owner,athlete,title")
      .eq("athlete", athleteId)
      .order("week", { ascending: true });

    if (error) {
      console.error("Error fetching schedule weeks:", error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving schedule weeks via SQL query:", error);
    throw error;
  }
};

export type ScheduleDayWithModules = ScheduleDayRow & { modules: ModuleRow[] };

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
      .eq("weekId", weekId)
      .order("day", { ascending: true });

    if (scheduleDaysError) {
      console.error("Error fetching schedule days:", scheduleDaysError);
      throw scheduleDaysError;
    }

    const days = scheduleDays ?? [];
    if (days.length === 0) return [];

    const dayIds = days.map((day) => day.id);

    const { data: moduleLinks, error: moduleLinksError } = await supabase
      .from("_ModuleToScheduleDay")
      .select("A,B")
      .in("B", dayIds);

    if (moduleLinksError) {
      console.error("Error fetching module links for schedule days:", moduleLinksError);
      throw moduleLinksError;
    }

    const links = moduleLinks ?? [];
    if (links.length === 0) {
      return days.map((day) => ({ ...day, modules: [] }));
    }

    const moduleIds = Array.from(new Set(links.map((link) => link.A)));

    const { data: modules, error: modulesError } = await supabase
      .from("module")
      .select(
        "id,owner,name,category,subCategory,distance,duration,weight,description,comment,feeling,sleepHours",
      )
      .in("id", moduleIds);

    if (modulesError) {
      console.error("Error fetching modules for schedule days:", modulesError);
      throw modulesError;
    }

    const modulesList = modules ?? [];
    const modulesById = new Map(modulesList.map((module) => [module.id, module]));

    const modulesByDayId = new Map<string, ModuleRow[]>();
    dayIds.forEach((dayId) => modulesByDayId.set(dayId, []));

    links.forEach((link) => {
      const linkedModule = modulesById.get(link.A);
      if (!linkedModule) return;

      const current = modulesByDayId.get(link.B);
      if (current) {
        current.push(linkedModule);
      }
    });

    const aggregatedByDay = new Map<number, ScheduleDayWithModules>();

    days.forEach((day) => {
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
  } catch (error) {
    console.error("Error retrieving schedule days with modules via SQL query:", error);
    throw error;
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
  const daysByWeek = new Map<string, Map<number, ScheduleDayWithModules>>();

  const { data: days, error: daysError } = await supabase
    .from("scheduleDay")
    .select("id,day,weekId")
    .in("weekId", weekIds)
    .order("day", { ascending: true });

  if (daysError) {
    console.error("Error fetching schedule days:", daysError);
    throw daysError;
  }

  const dayRows = days ?? [];
  const dayIds = dayRows.map((day) => day.id);

  const links: ModuleScheduleDayRow[] = [];
  if (dayIds.length > 0) {
    const { data: moduleLinks, error: moduleLinksError } = await supabase
      .from("_ModuleToScheduleDay")
      .select("A,B")
      .in("B", dayIds);

    if (moduleLinksError) {
      console.error("Error fetching module links for schedule days:", moduleLinksError);
      throw moduleLinksError;
    }

    links.push(...(moduleLinks ?? []));
  }

  const moduleIds = Array.from(new Set(links.map((link) => link.A)));

  const modulesList: ModuleRow[] = [];
  if (moduleIds.length > 0) {
    const { data: modules, error: modulesError } = await supabase
      .from("module")
      .select(
        "id,owner,name,category,subCategory,distance,duration,weight,description,comment,feeling,sleepHours",
      )
      .in("id", moduleIds);

    if (modulesError) {
      console.error("Error fetching modules for schedule days:", modulesError);
      throw modulesError;
    }

    modulesList.push(...(modules ?? []));
  }
  const modulesById = new Map(modulesList.map((module) => [module.id, module]));
  const modulesByDayId = new Map<string, ModuleRow[]>();
  dayIds.forEach((dayId) => modulesByDayId.set(dayId, []));

  links.forEach((link) => {
    const linkedModule = modulesById.get(link.A);
    if (!linkedModule) return;

    const current = modulesByDayId.get(link.B);
    if (current) {
      current.push(linkedModule);
    }
  });

  dayRows.forEach((day) => {
    const weekId = day.weekId ?? "";
    if (!daysByWeek.has(weekId)) {
      daysByWeek.set(weekId, new Map());
    }

    const weekDays = daysByWeek.get(weekId)!;
    const modulesForDay = modulesByDayId.get(day.id) ?? [];
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
      .select("id,week,owner,athlete,title")
      .eq("athlete", input.athleteId)
      .eq("week", input.week)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching schedule week by athlete and week:", error);
      throw error;
    }

    const existingWeeks = data ?? [];

    if (existingWeeks.length > 1) {
      throw new Error(
        "Flera scheman finns redan fAr samma vecka. Rensa dubbletter innan du fortsAtter.",
      );
    }

    return existingWeeks[0] ?? null;
  } catch (error) {
    console.error("Error retrieving schedule week via SQL query:", error);
    throw error;
  }
};

const deleteScheduleLinksForDays = async (dayIds: string[]) => {
  if (dayIds.length === 0) return;

  const { error } = await supabase.from("_ModuleToScheduleDay").delete().in("B", dayIds);

  if (error) {
    console.error("Error deleting module links for schedule days:", error);
    throw error;
  }
};

const deleteScheduleDays = async (weekId: string, dayIds: string[]) => {
  if (dayIds.length === 0) return;

  const { error } = await supabase
    .from("scheduleDay")
    .delete()
    .in("id", dayIds)
    .eq("weekId", weekId);

  if (error) {
    console.error("Error deleting schedule days:", error);
    throw error;
  }
};

export const clearScheduleWeek = async (weekId: string): Promise<void> => {
  try {
    const { data: existingDays, error } = await supabase
      .from("scheduleDay")
      .select("id")
      .eq("weekId", weekId);

    if (error) {
      console.error("Error fetching schedule days to clear:", error);
      throw error;
    }

    const dayIds = (existingDays ?? []).map((day) => day.id);
    if (dayIds.length === 0) return;

    await deleteScheduleLinksForDays(dayIds);
    await deleteScheduleDays(weekId, dayIds);
  } catch (error) {
    console.error("Error clearing schedule week via SQL query:", error);
    throw error;
  }
};

export const getScheduleWeekWithModulesById = async (
  weekId: string,
): Promise<ScheduleWeekWithModules | null> => {
  try {
    const { data: week, error } = await supabase
      .from("scheduleWeek")
      .select("id,week,owner,athlete,title")
      .eq("id", weekId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching schedule week by id:", error);
      throw error;
    }

    if (!week) return null;

    const days = await getScheduleDaysWithModules(week.id);

    return {
      ...week,
      days: fillMissingDays(week.id, days),
    };
  } catch (error) {
    console.error("Error retrieving schedule week with modules via SQL query:", error);
    throw error;
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
      throw error;
    }

    return data;
  } catch (error) {
    console.error("ƒ?O Error creating module:", error);
    throw error;
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
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting schedule week via SQL query:", error);
    throw error;
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
    const { data, error } = await supabase
      .from("scheduleWeek")
      .update(body)
      .eq("id", weekId)
      .select()
      .single();

    if (error) {
      console.error("Error updating schedule week:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting schedule week updates via SQL query:", error);
    throw error;
  }
};

const createScheduleDay = async (weekId: string, day: number): Promise<ScheduleDayRow> => {
  try {
    const { data: existingDay, error: existingError } = await supabase
      .from("scheduleDay")
      .select("id,day,weekId")
      .eq("weekId", weekId)
      .eq("day", day)
      .order("id", { ascending: true })
      .limit(1);

    if (existingError) {
      console.error("Error checking for existing schedule day:", existingError);
      throw existingError;
    }

    const alreadyCreatedDay = existingDay?.[0];
    if (alreadyCreatedDay) {
      return alreadyCreatedDay;
    }

    const { data, error } = await supabase
      .from("scheduleDay")
      .insert({ weekId, day })
      .select()
      .single();

    if (error) {
      console.error("Error creating schedule day:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting schedule day via SQL query:", error);
    throw error;
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
        B: dayRow.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error linking module to schedule day:", error);
      throw error;
    }

    return { day: dayRow, link: linkRow };
  } catch (error) {
    console.error("Error persisting module link via SQL query:", error);
    throw error;
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
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting user via SQL query:", error);
    throw error;
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
      throw error;
    }

    console.log("ƒo. User found:", user);
    return user;
  } catch (error) {
    console.error("ƒ?O Error finding user by email:", error);
    throw error;
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
