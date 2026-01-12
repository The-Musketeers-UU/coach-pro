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
    .select("id,visibleToAllCoaches")
    .eq("owner", coachId)
    .eq("name", moduleTemplate.name)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Unable to check existing modules: ${existingError.message}`);
  }

  if (existingModule?.id) {
    if (!existingModule.visibleToAllCoaches) {
      const { error: updateError } = await supabase
        .from("module")
        .update({ visibleToAllCoaches: true })
        .eq("id", existingModule.id);

      if (updateError) {
        throw new Error(`Unable to update module '${moduleTemplate.name}': ${updateError.message}`);
      }
    }
    return toNumericId(existingModule.id, "moduleId");
  }

  const payload = {
    owner: coachId,
    name: moduleTemplate.name,
    category: moduleTemplate.category,
    subCategory: moduleTemplate.subCategory ?? null,
    description: moduleTemplate.description ?? null,
    visibleToAllCoaches: true,
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

const main = async () => {
  const seedData = await readSeedFile();
  const users = await fetchUsers();

  const coaches = users.filter((user) => user.isCoach);

  if (coaches.length === 0) {
    throw new Error("No coaches found in the database. Add at least one coach user before seeding.");
  }

  console.log(`Loaded ${seedData.modules?.length ?? 0} modules from ${seedFilePath}`);

  const moduleCache = new Map();

  const getModulesForCoach = async (coachId) => {
    if (moduleCache.has(coachId)) {
      return moduleCache.get(coachId);
    }

    const modules = await ensureModulesForCoach(coachId, seedData.modules ?? []);
    moduleCache.set(coachId, modules);
    return modules;
  };

  for (const coach of coaches) {
    await getModulesForCoach(coach.id);
    console.log(`Seeded ${seedData.modules?.length ?? 0} modules for coach ${coach.email}.`);
  }

  console.log("Seeding completed successfully.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
