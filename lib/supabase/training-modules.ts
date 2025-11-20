import { supabaseRequest } from "./client";

type ModuleFocus = "STRENGTH" | "CONDITIONING" | "MOBILITY" | "MINDSET" | "RECOVERY";
type ModuleIntensity = "LOW" | "MODERATE" | "HIGH";

type TrainingModuleRow = {
  id: string;
  title: string;
  focus: ModuleFocus;
  intensity: ModuleIntensity;
  duration_minutes: number;
  description: string;
  created_by_id: string | null;
};

type TrainingDayRow = {
  id: string;
  day_of_week: string;
  schedule_id: string;
};

type ScheduledModuleRow = {
  id: number;
  position: number;
  notes: string | null;
  day_id: string;
  module_id: string;
};

export type CreateTrainingModuleInput = {
  title: string;
  focus: ModuleFocus;
  intensity: ModuleIntensity;
  durationMinutes: number;
  description: string;
  createdById?: string | null;
};

export const createTrainingModule = async (
  input: CreateTrainingModuleInput,
): Promise<TrainingModuleRow> => {
  const payload = {
    title: input.title,
    focus: input.focus,
    intensity: input.intensity,
    duration_minutes: input.durationMinutes,
    description: input.description,
    created_by_id: input.createdById ?? null,
  } satisfies Omit<TrainingModuleRow, "id">;

  const data = await supabaseRequest<TrainingModuleRow[]>("training_modules", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return data[0];
};

export type AddModuleToScheduleInput = {
  scheduleId: string;
  dayOfWeek: string;
  moduleId: string;
  position?: number;
  notes?: string;
};

export const addModuleToSchedule = async (
  input: AddModuleToScheduleInput,
): Promise<{ day: TrainingDayRow; scheduledModule: ScheduledModuleRow }> => {
  const [day] = await supabaseRequest<TrainingDayRow[]>("training_days", {
    method: "POST",
    body: {
      schedule_id: input.scheduleId,
      day_of_week: input.dayOfWeek,
    },
    prefer: "resolution=merge-duplicates,return=representation",
    searchParams: {
      on_conflict: "schedule_id,day_of_week",
    },
  });

  const moduleRows = await supabaseRequest<ScheduledModuleRow[]>("scheduled_modules", {
    method: "POST",
    body: {
      day_id: day.id,
      module_id: input.moduleId,
      position: input.position ?? 0,
      notes: input.notes ?? null,
    },
    prefer: "return=representation",
  });

  return { day, scheduledModule: moduleRows[0] };
};
