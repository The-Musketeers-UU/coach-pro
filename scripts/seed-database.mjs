import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import pkg from "@next/env";

const { loadEnvConfig } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
loadEnvConfig(projectRoot);

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "http://localhost:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY is required to seed data. Make sure your environment variables are configured.",
  );
  process.exit(1);
}
const defaultSeedPath = path.resolve(__dirname, "../data/seed-data.json");
const seedFilePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultSeedPath;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const toNumericId = (value, label = "id") => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid ${label} value: ${String(value)}`);
  }
  return parsed;
};

const readSeedFile = async () => {
  const raw = await fs.readFile(seedFilePath, "utf8");
  return JSON.parse(raw);
};

const fetchUsers = async () => {
  const { data, error } = await supabase.from("user").select("id,name,email,isCoach");

  if (error) {
    throw new Error(`Unable to fetch users: ${error.message}`);
  }

  return data ?? [];
};

const ensureModuleForCoach = async (coachId, moduleTemplate) => {
  const { data: existingModule, error: existingError } = await supabase
    .from("module")
    .select("id")
    .eq("owner", coachId)
    .eq("name", moduleTemplate.name)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Unable to check existing modules: ${existingError.message}`);
  }

  if (existingModule?.id) {
    return toNumericId(existingModule.id, "moduleId");
  }

  const payload = {
    owner: coachId,
    name: moduleTemplate.name,
    category: moduleTemplate.category,
    subCategory: moduleTemplate.subCategory ?? null,
    description: moduleTemplate.description ?? null,
    activeFeedbackFields: Array.isArray(moduleTemplate.feedbackFields)
      ? moduleTemplate.feedbackFields
      : [],
  };

  const { data: createdModule, error } = await supabase
    .from("module")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create module '${moduleTemplate.name}': ${error.message}`);
  }

  return toNumericId(createdModule.id, "moduleId");
};

const ensureModulesForCoach = async (coachId, moduleTemplates) => {
  const moduleIds = new Map();

  for (const moduleTemplate of moduleTemplates) {
    const id = await ensureModuleForCoach(coachId, moduleTemplate);
    moduleIds.set(moduleTemplate.name, id);
  }

  return moduleIds;
};

const deleteExistingWeek = async (weekId) => {
  const weekNumericId = toNumericId(weekId, "weekId");

  const { data: days, error: dayError } = await supabase
    .from("scheduleDay")
    .select("id")
    .eq("weekId", weekNumericId);

  if (dayError) {
    throw new Error(`Unable to fetch schedule days for cleanup: ${dayError.message}`);
  }

  const dayIds = (days ?? []).map((day) => toNumericId(day.id, "dayId"));

  if (dayIds.length > 0) {
    const { error: feedbackError } = await supabase
      .from("scheduleModuleFeedback")
      .delete()
      .in("scheduleDayId", dayIds);

    if (feedbackError) {
      throw new Error(`Unable to delete existing feedback: ${feedbackError.message}`);
    }

    const { error: linkError } = await supabase.from("_ModuleToScheduleDay").delete().in("B", dayIds);
    if (linkError) {
      throw new Error(`Unable to delete existing module links: ${linkError.message}`);
    }

    const { error: dayDeleteError } = await supabase.from("scheduleDay").delete().eq("weekId", weekNumericId);
    if (dayDeleteError) {
      throw new Error(`Unable to delete existing schedule days: ${dayDeleteError.message}`);
    }
  }

  const { error: weekDeleteError } = await supabase.from("scheduleWeek").delete().eq("id", weekNumericId);
  if (weekDeleteError) {
    throw new Error(`Unable to delete existing schedule week: ${weekDeleteError.message}`);
  }
};

const clearExistingWeeksForAthleteAndNumber = async (athleteId, weekNumber) => {
  const { data: existingWeeks, error } = await supabase
    .from("scheduleWeek")
    .select("id")
    .eq("athlete", athleteId)
    .eq("week", weekNumber);

  if (error) {
    throw new Error(`Unable to find existing weeks for cleanup: ${error.message}`);
  }

  for (const week of existingWeeks ?? []) {
    await deleteExistingWeek(week.id);
  }
};

const createScheduleWeek = async (ownerId, athleteId, template) => {
  await clearExistingWeeksForAthleteAndNumber(athleteId, template.week);

  const payload = {
    owner: ownerId,
    athlete: athleteId,
    week: template.week,
    title: template.title || `Week ${template.week}`,
  };

  const { data, error } = await supabase.from("scheduleWeek").insert(payload).select("id").single();

  if (error) {
    throw new Error(`Unable to create schedule week ${template.week}: ${error.message}`);
  }

  return toNumericId(data.id, "weekId");
};

const createScheduleDay = async (weekId, dayNumber) => {
  const { data, error } = await supabase
    .from("scheduleDay")
    .insert({ weekId: toNumericId(weekId, "weekId"), day: dayNumber })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Unable to create day ${dayNumber}: ${error.message}`);
  }

  return toNumericId(data.id, "dayId");
};

const linkModuleToDay = async (moduleId, dayId) => {
  const moduleNumericId = toNumericId(moduleId, "moduleId");
  const dayNumericId = toNumericId(dayId, "dayId");

  const { error } = await supabase.from("_ModuleToScheduleDay").insert({ A: moduleNumericId, B: dayNumericId });
  if (error) {
    throw new Error(`Unable to link module ${moduleNumericId} to day ${dayNumericId}: ${error.message}`);
  }
};

const applyFeedback = async (dayId, moduleId, feedback) => {
  const payload = {
    moduleId: toNumericId(moduleId, "moduleId"),
    scheduleDayId: toNumericId(dayId, "dayId"),
    distance: feedback.distance ?? {},
    duration: feedback.duration ?? {},
    weight: feedback.weight ?? {},
    comment: feedback.comment ?? null,
    feeling: feedback.feeling ?? null,
    sleepHours: feedback.sleepHours ?? null,
  };

  const { error } = await supabase
    .from("scheduleModuleFeedback")
    .upsert(payload, { onConflict: "moduleId,scheduleDayId" });

  if (error) {
    throw new Error(`Unable to add feedback for module ${moduleId}: ${error.message}`);
  }
};

const populateScheduleForAthlete = async (coach, athlete, templates, moduleIds) => {
  for (const template of templates) {
    const weekId = await createScheduleWeek(coach.id, athlete.id, template);

    for (const day of template.days ?? []) {
      const dayId = await createScheduleDay(weekId, day.day);

      for (const moduleName of day.modules ?? []) {
        const moduleId = moduleIds.get(moduleName);
        if (!moduleId) {
          console.warn(`Skipping unknown module '${moduleName}' for day ${day.day}`);
          continue;
        }

        await linkModuleToDay(moduleId, dayId);

        const feedback = day.feedback?.[moduleName];
        if (feedback) {
          await applyFeedback(dayId, moduleId, feedback);
        }
      }
    }
  }
};

const main = async () => {
  const seedData = await readSeedFile();
  const users = await fetchUsers();

  const coaches = users.filter((user) => user.isCoach);
  const athletes = users.filter((user) => !user.isCoach);

  if (coaches.length === 0) {
    throw new Error("No coaches found in the database. Add at least one coach user before seeding.");
  }

  if (athletes.length === 0) {
    throw new Error("No athletes found in the database. Add at least one athlete user before seeding.");
  }

  console.log(`Loaded ${seedData.modules?.length ?? 0} modules and ${seedData.schedules?.length ?? 0} schedules from ${seedFilePath}`);

  const moduleCache = new Map();

  const getModulesForCoach = async (coachId) => {
    if (moduleCache.has(coachId)) {
      return moduleCache.get(coachId);
    }

    const modules = await ensureModulesForCoach(coachId, seedData.modules ?? []);
    moduleCache.set(coachId, modules);
    return modules;
  };

  for (const [index, athlete] of athletes.entries()) {
    const coach = coaches[index % coaches.length];
    const moduleIds = await getModulesForCoach(coach.id);
    await populateScheduleForAthlete(coach, athlete, seedData.schedules ?? [], moduleIds);

    console.log(
      `Seeded ${seedData.schedules?.length ?? 0} weeks for athlete ${athlete.email} using coach ${coach.email}.`,
    );
  }

  console.log("Seeding completed successfully.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
