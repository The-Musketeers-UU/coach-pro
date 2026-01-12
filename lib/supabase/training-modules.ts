import type {
  PostgrestError,
  SupabaseClient,
  User as SupabaseAuthUser,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export type FeedbackFieldType =
  | "distance"
  | "duration"
  | "weight"
  | "comment"
  | "feeling"
  | "sleepHours";

export type FeedbackFieldDefinition = {
  id: string;
  type: FeedbackFieldType;
  label?: string | null;
};

export type FeedbackResponse = {
  fieldId: string;
  type: FeedbackFieldType;
  value: number | string | null;
};

type FeedbackMetricMap = Record<string, number | null>;

type DbModuleRow = {
  id: number | string;
  owner: string;
  name: string;
  category: string;
  subCategory: string | null;
  description: string | null;
  visibleToAllCoaches: boolean;
  activeFeedbackFields: unknown;
};

export type ModuleRow = Omit<DbModuleRow, "activeFeedbackFields"> & {
  id: string;
  activeFeedbackFields: FeedbackFieldDefinition[];
};

const moduleSelectColumns =
  "id,owner,name,category,subCategory,description,visibleToAllCoaches,activeFeedbackFields";

type DbScheduleModuleFeedbackRow = {
  id: number | string;
  moduleId: number | string;
  scheduleDayId: number | string;
  distance: unknown;
  duration: unknown;
  weight: unknown;
  comment: string | null;
  feeling: number | null;
  sleepHours: number | null;
};

export type ScheduleModuleFeedbackRow = {
  id: string;
  moduleId: string;
  scheduleDayId: string;
  distance: number | null;
  duration: number | null;
  weight: number | null;
  distanceEntries: FeedbackMetricMap;
  durationEntries: FeedbackMetricMap;
  weightEntries: FeedbackMetricMap;
  comment: string | null;
  feeling: number | null;
  sleepHours: number | null;
  responses: FeedbackResponse[];
};

type DbScheduleWeekRow = {
  id: number | string;
  owner: string;
  athlete: string;
  week: number;
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

export type TrainingGroupWithMembers = {
  id: string;
  name: string;
  headCoach: AthleteRow;
  assistantCoaches: AthleteRow[];
  athletes: AthleteRow[];
};

export type TrainingGroupMembershipStatus = "accepted" | "pending";

export type TrainingGroupInvite = {
  groupId: string;
  groupName: string;
  headCoach: AthleteRow;
  role: "assistantCoach" | "athlete";
};

export type CreateTrainingGroupInput = {
  name: string;
  headCoachId: string;
  athleteIds?: string[];
  assistantCoachIds?: string[];
  createdById?: string;
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

const parseFeedbackFields = (raw: unknown): FeedbackFieldDefinition[] => {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as { id?: unknown; type?: unknown; label?: unknown };
      if (typeof candidate.id !== "string" || typeof candidate.type !== "string") {
        return null;
      }

      return {
        id: candidate.id,
        type: candidate.type as FeedbackFieldType,
        label:
          typeof candidate.label === "string" || candidate.label === null
            ? candidate.label
            : undefined,
      } satisfies FeedbackFieldDefinition;
    })
    .filter(Boolean) as FeedbackFieldDefinition[];
};

const parseFeedbackMetricMap = (raw: unknown): FeedbackMetricMap => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const entries = Object.entries(raw as Record<string, unknown>);

  return entries.reduce((acc, [key, value]) => {
    if (typeof key !== "string") return acc;

    if (typeof value === "number" && Number.isFinite(value)) {
      acc[key] = value;
      return acc;
    }

    if (value === null) {
      acc[key] = null;
    }

    return acc;
  }, {} as FeedbackMetricMap);
};

const calculateMetricTotal = (metric: FeedbackMetricMap): number | null => {
  const values = Object.values(metric).filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value),
  );

  if (values.length === 0) return null;

  return values.reduce((sum, value) => sum + value, 0);
};

const coerceModuleRow = (row: DbModuleRow): ModuleRow => ({
  ...row,
  id: toId(row.id),
  activeFeedbackFields: parseFeedbackFields(row.activeFeedbackFields),
});

const coerceScheduleModuleFeedbackRow = (
  row: DbScheduleModuleFeedbackRow,
): ScheduleModuleFeedbackRow => {
  const distanceEntries = parseFeedbackMetricMap(row.distance);
  const durationEntries = parseFeedbackMetricMap(row.duration);
  const weightEntries = parseFeedbackMetricMap(row.weight);

  return {
    id: toId(row.id),
    moduleId: toId(row.moduleId),
    scheduleDayId: toId(row.scheduleDayId),
    distance: calculateMetricTotal(distanceEntries),
    duration: calculateMetricTotal(durationEntries),
    weight: calculateMetricTotal(weightEntries),
    distanceEntries,
    durationEntries,
    weightEntries,
    comment: row.comment,
    feeling: row.feeling,
    sleepHours: row.sleepHours,
    responses: [],
  } satisfies ScheduleModuleFeedbackRow;
};

const buildFeedbackResponses = (
  fields: FeedbackFieldDefinition[],
  feedback: ScheduleModuleFeedbackRow,
): FeedbackResponse[] => {
  const responses: FeedbackResponse[] = [];
  const fieldsByType = new Map<FeedbackFieldType, FeedbackFieldDefinition[]>();

  fields.forEach((field) => {
    const existing = fieldsByType.get(field.type) ?? [];
    existing.push(field);
    fieldsByType.set(field.type, existing);
  });

  const addMetricResponses = (
    type: Extract<FeedbackFieldType, "distance" | "duration" | "weight">,
    entries: FeedbackMetricMap,
  ) => {
    const definitions = fieldsByType.get(type) ?? [];
    const definitionsById = new Set(definitions.map((field) => field.id));

    definitions.forEach((field) => {
      responses.push({
        fieldId: field.id,
        type,
        value: entries[field.id] ?? null,
      });
    });

    Object.entries(entries).forEach(([fieldId, value]) => {
      if (definitionsById.has(fieldId)) return;

      responses.push({ fieldId, type, value });
    });
  };

  addMetricResponses("distance", feedback.distanceEntries);
  addMetricResponses("duration", feedback.durationEntries);
  addMetricResponses("weight", feedback.weightEntries);

  const addSingletonResponse = (
    type: Extract<FeedbackFieldType, "comment" | "feeling" | "sleepHours">,
    value: number | string | null,
  ) => {
    const definition = fieldsByType.get(type)?.[0];
    if (!definition) return;

    responses.push({
      fieldId: definition.id,
      type,
      value,
    });
  };

  addSingletonResponse("comment", feedback.comment ?? null);
  addSingletonResponse("feeling", feedback.feeling ?? null);
  addSingletonResponse("sleepHours", feedback.sleepHours ?? null);

  return responses;
};

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
      const responses = feedback
        ? buildFeedbackResponses(module.activeFeedbackFields ?? [], feedback)
        : [];
      const enrichedFeedback = feedback
        ? { ...feedback, responses }
        : undefined;
      return {
        ...module,
        scheduleDayId: dayId,
        feedback: enrichedFeedback,
      } satisfies ScheduleDayModule;
    });

    result.set(dayId, enriched);
  });

  return result;
};

const formatFeedbackPayloadFromResponses = (responses: FeedbackResponse[]) => {
  const distance: FeedbackMetricMap = {};
  const duration: FeedbackMetricMap = {};
  const weight: FeedbackMetricMap = {};
  let comment: string | null = null;
  let feeling: number | null = null;
  let sleepHours: number | null = null;

  const toNumberOrNull = (value: number | string | null) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    return null;
  };

  responses.forEach((response) => {
    switch (response.type) {
      case "distance":
        distance[response.fieldId] = toNumberOrNull(response.value);
        break;
      case "duration":
        duration[response.fieldId] = toNumberOrNull(response.value);
        break;
      case "weight":
        weight[response.fieldId] = toNumberOrNull(response.value);
        break;
      case "comment":
        comment = typeof response.value === "string" ? response.value : null;
        break;
      case "feeling":
        feeling = toNumberOrNull(response.value);
        break;
      case "sleepHours":
        sleepHours = toNumberOrNull(response.value);
        break;
      default:
        break;
    }
  });

  return { distance, duration, weight, comment, feeling, sleepHours };
};

export const getModulesByOwner = async (ownerId: string): Promise<ModuleRow[]> => {
  try {
    const { data, error } = await supabase
      .from("module")
      .select(moduleSelectColumns)
      .or(`owner.eq.${ownerId},visibleToAllCoaches.eq.true`)
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
  id: string;
  name: string;
  email: string;
  isCoach?: boolean;
  accessToken?: string;
};

export type CreateModuleInput = {
  ownerId: string;
  name: string;
  category: string;
  subCategory?: string;
  description?: string;
  feedbackFields?: FeedbackFieldDefinition[];
  visibleToAllCoaches?: boolean;
};

export type UpdateModuleInput = {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  description?: string;
  feedbackFields?: FeedbackFieldDefinition[];
  visibleToAllCoaches?: boolean;
};

export type CreateScheduleWeekInput = {
  ownerId: string;
  athleteId: string;
  week: number;
  title: string;
};

export type UpsertScheduleModuleFeedbackInput = {
  moduleId: string;
  scheduleDayId: string;
  responses: FeedbackResponse[];
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

type DbTrainingGroupRow = {
  id: number | string;
  name: string;
  headCoach: AthleteRow | null;
  coaches?: { coach: AthleteRow | null; status?: TrainingGroupMembershipStatus | null }[];
  athletes?: { athlete: AthleteRow | null; status?: TrainingGroupMembershipStatus | null }[];
};

const isAcceptedMembership = (status?: TrainingGroupMembershipStatus | null) =>
  status === "accepted" || !status;

const coerceTrainingGroupRow = (row: DbTrainingGroupRow): TrainingGroupWithMembers => {
  if (!row.headCoach) {
    throw new Error("Training group is missing head coach data.");
  }

  return {
    id: toId(row.id),
    name: row.name,
    headCoach: row.headCoach,
    assistantCoaches: (row.coaches ?? [])
      .filter((coachRow) => isAcceptedMembership(coachRow.status))
      .map((coachRow) => coachRow.coach)
      .filter(Boolean) as AthleteRow[],
    athletes: (row.athletes ?? [])
      .filter((athleteRow) => isAcceptedMembership(athleteRow.status))
      .map((athleteRow) => athleteRow.athlete)
      .filter(Boolean) as AthleteRow[],
  } satisfies TrainingGroupWithMembers;
};

const uniqueIds = (ids: string[]) => Array.from(new Set(ids.filter(Boolean)));

export const searchUsers = async (
  query: string,
  role?: "coach" | "athlete",
): Promise<AthleteRow[]> => {
  const trimmedQuery = query.trim();

  try {
    let request = supabase
      .from("user")
      .select("id,name,email,isCoach")
      .order("name", { ascending: true })
      .limit(20);

    if (role) {
      request = request.eq("isCoach", role === "coach");
    }

    if (trimmedQuery) {
      request = request.or(`name.ilike.%${trimmedQuery}%,email.ilike.%${trimmedQuery}%`);
    }

    const { data, error } = await request;

    if (error) {
      console.error("Error searching users:", error);
      throw toReadableError(error);
    }

    return data ?? [];
  } catch (error) {
    console.error("Error performing user search:", error);
    throw toReadableError(error);
  }
};

const getTrainingGroupsForCoach = async (
  coachId: string,
): Promise<TrainingGroupWithMembers[]> => {
  const groupIds = new Set<string>();

  const { data: headCoachGroups, error: headCoachError } = await supabase
    .from("trainingGroup")
    .select("id")
    .eq("headCoach", coachId);

  if (headCoachError) {
    console.error("Error fetching groups for head coach:", headCoachError);
    throw toReadableError(headCoachError);
  }

  headCoachGroups?.forEach((group) => groupIds.add(toId(group.id)));

  const { data: assistantGroups, error: assistantError } = await supabase
    .from("trainingGroupCoach")
    .select("group")
    .eq("coach", coachId)
    .eq("status", "accepted");

  if (assistantError) {
    console.error("Error fetching groups for assistant coach:", assistantError);
    throw toReadableError(assistantError);
  }

  assistantGroups?.forEach((group) => groupIds.add(toId(group.group)));

  return getTrainingGroupsByIds(Array.from(groupIds));
};

export const getCoachAthletes = async (
  coachId: string,
): Promise<AthleteRow[]> => {
  try {
    const trainingGroups = await getTrainingGroupsForCoach(coachId);
    const athletesById = new Map<string, AthleteRow>();

    trainingGroups.forEach((group) => {
      group.athletes.forEach((athlete) => {
        athletesById.set(athlete.id, athlete);
      });
    });

    const athletes = Array.from(athletesById.values());

    return athletes.sort((a, b) => a.name.localeCompare(b.name, "sv"));
  } catch (error) {
    console.error("Error retrieving coach athletes via SQL query:", error);
    throw toReadableError(error);
  }
};

const getTrainingGroupsByIds = async (
  groupIds: string[],
): Promise<TrainingGroupWithMembers[]> => {
  if (groupIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from("trainingGroup")
      .select(
        `id,name,headCoach:headCoach (id,name,email,isCoach),coaches:trainingGroupCoach (status,coach:coach (id,name,email,isCoach)),athletes:trainingGroupAthlete (status,athlete:athlete (id,name,email,isCoach))`,
      )
      .in("id", toDbNumericIds(groupIds))
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching training groups:", error);
      throw toReadableError(error);
    }

    const rows = (data ?? []) as unknown as DbTrainingGroupRow[];

    return rows.map(coerceTrainingGroupRow);
  } catch (error) {
    console.error("Error retrieving training groups via SQL query:", error);
    throw toReadableError(error);
  }
};

export const getTrainingGroupsForUser = async (
  userId: string,
): Promise<TrainingGroupWithMembers[]> => {
  try {
    const groupIds = new Set<string>();

    const { data: headCoachGroups, error: headCoachError } = await supabase
      .from("trainingGroup")
      .select("id")
      .eq("headCoach", userId);

    if (headCoachError) {
      console.error("Error fetching groups for head coach:", headCoachError);
      throw toReadableError(headCoachError);
    }

    headCoachGroups?.forEach((group) => groupIds.add(toId(group.id)));

    const { data: assistantGroups, error: assistantError } = await supabase
      .from("trainingGroupCoach")
      .select("group")
      .eq("coach", userId)
      .eq("status", "accepted");

    if (assistantError) {
      console.error("Error fetching assistant coach groups:", assistantError);
      throw toReadableError(assistantError);
    }

    assistantGroups?.forEach((group) => groupIds.add(toId(group.group)));

    const { data: athleteGroups, error: athleteError } = await supabase
      .from("trainingGroupAthlete")
      .select("group")
      .eq("athlete", userId)
      .eq("status", "accepted");

    if (athleteError) {
      console.error("Error fetching athlete groups:", athleteError);
      throw toReadableError(athleteError);
    }

    athleteGroups?.forEach((group) => groupIds.add(toId(group.group)));

    return getTrainingGroupsByIds(Array.from(groupIds));
  } catch (error) {
    console.error("Error retrieving training groups:", error);
    throw toReadableError(error);
  }
};

export const createTrainingGroup = async (
  input: CreateTrainingGroupInput,
): Promise<TrainingGroupWithMembers> => {
  const payload = { name: input.name.trim(), headCoach: input.headCoachId };

  if (!payload.name) {
    throw new Error("Gruppen måste ha ett namn.");
  }

  try {
    const createdById = input.createdById;
    const { data: group, error: groupError } = await supabase
      .from("trainingGroup")
      .insert(payload)
      .select("id")
      .single();

    if (groupError) {
      console.error("Error creating training group:", groupError);
      throw toReadableError(groupError);
    }

    const groupId = toId(group?.id);
    const assistantCoachIds = uniqueIds(input.assistantCoachIds ?? []).filter(
      (coachId) => coachId !== input.headCoachId,
    );

    if (assistantCoachIds.length > 0) {
      const { error: coachesError } = await supabase.from("trainingGroupCoach").insert(
        assistantCoachIds.map((coachId) => ({
          group: toDbNumericId(groupId),
          coach: coachId,
          status: coachId === createdById ? "accepted" : "pending",
        })),
      );

      if (coachesError) {
        console.error("Error linking assistant coaches:", coachesError);
        throw toReadableError(coachesError);
      }
    }

    const athleteIds = uniqueIds(input.athleteIds ?? []);
    if (athleteIds.length > 0) {
      const { error: athletesError } = await supabase.from("trainingGroupAthlete").insert(
        athleteIds.map((athleteId) => ({
          group: toDbNumericId(groupId),
          athlete: athleteId,
          status: athleteId === createdById ? "accepted" : "pending",
        })),
      );

      if (athletesError) {
        console.error("Error linking athletes to group:", athletesError);
        throw toReadableError(athletesError);
      }
    }

    const groups = await getTrainingGroupsByIds([groupId]);
    const createdGroup = groups[0];

    if (!createdGroup) {
      throw new Error("Kunde inte läsa in den skapade träningsgruppen.");
    }

    return createdGroup;
  } catch (error) {
    console.error("Error creating training group via SQL query:", error);
    throw toReadableError(error);
  }
};

export const getPendingTrainingGroupInvites = async (
  userId: string,
): Promise<TrainingGroupInvite[]> => {
  try {
    const { data: coachInvites, error: coachError } = await supabase
      .from("trainingGroupCoach")
      .select(
        "group:group (id,name,headCoach:headCoach (id,name,email,isCoach)),status,coach",
      )
      .eq("coach", userId)
      .eq("status", "pending");

    if (coachError) {
      console.error("Error fetching pending coach invites:", coachError);
      throw toReadableError(coachError);
    }

    const { data: athleteInvites, error: athleteError } = await supabase
      .from("trainingGroupAthlete")
      .select(
        "group:group (id,name,headCoach:headCoach (id,name,email,isCoach)),status,athlete",
      )
      .eq("athlete", userId)
      .eq("status", "pending");

    if (athleteError) {
      console.error("Error fetching pending athlete invites:", athleteError);
      throw toReadableError(athleteError);
    }

    const coachInviteRows = (coachInvites ?? []) as unknown as Array<{
      group:
        | { id: number | string; name: string; headCoach: AthleteRow | null }
        | { id: number | string; name: string; headCoach: AthleteRow | null }[]
        | null;
    }>;
    const athleteInviteRows = (athleteInvites ?? []) as unknown as Array<{
      group:
        | { id: number | string; name: string; headCoach: AthleteRow | null }
        | { id: number | string; name: string; headCoach: AthleteRow | null }[]
        | null;
    }>;

    const invites: TrainingGroupInvite[] = [];

    const getInviteGroup = (
      group:
        | { id: number | string; name: string; headCoach: AthleteRow | null }
        | { id: number | string; name: string; headCoach: AthleteRow | null }[]
        | null,
    ) => (Array.isArray(group) ? group[0] : group);

    coachInviteRows.forEach((row) => {
      const group = getInviteGroup(row.group);
      if (!group?.headCoach) return;
      invites.push({
        groupId: toId(group.id),
        groupName: group.name,
        headCoach: group.headCoach,
        role: "assistantCoach",
      });
    });

    athleteInviteRows.forEach((row) => {
      const group = getInviteGroup(row.group);
      if (!group?.headCoach) return;
      invites.push({
        groupId: toId(group.id),
        groupName: group.name,
        headCoach: group.headCoach,
        role: "athlete",
      });
    });

    return invites;
  } catch (error) {
    console.error("Error retrieving pending training group invites:", error);
    throw toReadableError(error);
  }
};

export const acceptTrainingGroupInvite = async (
  groupId: string,
  role: TrainingGroupInvite["role"],
  userId: string,
): Promise<void> => {
  try {
    if (role === "assistantCoach") {
      const { error } = await supabase
        .from("trainingGroupCoach")
        .update({ status: "accepted" })
        .eq("group", toDbNumericId(groupId))
        .eq("coach", userId)
        .eq("status", "pending");

      if (error) {
        console.error("Error accepting coach invite:", error);
        throw toReadableError(error);
      }
      return;
    }

    const { error } = await supabase
      .from("trainingGroupAthlete")
      .update({ status: "accepted" })
      .eq("group", toDbNumericId(groupId))
      .eq("athlete", userId)
      .eq("status", "pending");

    if (error) {
      console.error("Error accepting athlete invite:", error);
      throw toReadableError(error);
    }
  } catch (error) {
    console.error("Error accepting training group invite:", error);
    throw toReadableError(error);
  }
};

export const declineTrainingGroupInvite = async (
  groupId: string,
  role: TrainingGroupInvite["role"],
  userId: string,
): Promise<void> => {
  try {
    if (role === "assistantCoach") {
      const { error } = await supabase
        .from("trainingGroupCoach")
        .delete()
        .eq("group", toDbNumericId(groupId))
        .eq("coach", userId)
        .eq("status", "pending");

      if (error) {
        console.error("Error declining coach invite:", error);
        throw toReadableError(error);
      }
      return;
    }

    const { error } = await supabase
      .from("trainingGroupAthlete")
      .delete()
      .eq("group", toDbNumericId(groupId))
      .eq("athlete", userId)
      .eq("status", "pending");

    if (error) {
      console.error("Error declining athlete invite:", error);
      throw toReadableError(error);
    }
  } catch (error) {
    console.error("Error declining training group invite:", error);
    throw toReadableError(error);
  }
};

export const leaveTrainingGroup = async (
  groupId: string,
  role: "assistantCoach" | "athlete",
  userId: string,
): Promise<void> => {
  try {
    if (role === "assistantCoach") {
      const { error } = await supabase
        .from("trainingGroupCoach")
        .delete()
        .eq("group", toDbNumericId(groupId))
        .eq("coach", userId)
        .eq("status", "accepted");

      if (error) {
        console.error("Error leaving assistant coach group:", error);
        throw toReadableError(error);
      }
      return;
    }

    const { error } = await supabase
      .from("trainingGroupAthlete")
      .delete()
      .eq("group", toDbNumericId(groupId))
      .eq("athlete", userId)
      .eq("status", "accepted");

    if (error) {
      console.error("Error leaving athlete group:", error);
      throw toReadableError(error);
    }
  } catch (error) {
    console.error("Error leaving training group:", error);
    throw toReadableError(error);
  }
};

const hasExistingMembership = async (
  groupId: string,
  role: "assistantCoach" | "athlete",
  userId: string,
): Promise<boolean> => {
  try {
    if (role === "assistantCoach") {
      const { data, error } = await supabase
        .from("trainingGroupCoach")
        .select("coach")
        .eq("group", toDbNumericId(groupId))
        .eq("coach", userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error checking coach membership:", error);
        throw toReadableError(error);
      }

      return Boolean(data);
    }

    const { data, error } = await supabase
      .from("trainingGroupAthlete")
      .select("athlete")
      .eq("group", toDbNumericId(groupId))
      .eq("athlete", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error checking athlete membership:", error);
      throw toReadableError(error);
    }

    return Boolean(data);
  } catch (error) {
    console.error("Error verifying training group membership:", error);
    throw toReadableError(error);
  }
};

export const addTrainingGroupMember = async (
  groupId: string,
  role: "assistantCoach" | "athlete",
  userId: string,
): Promise<void> => {
  try {
    const exists = await hasExistingMembership(groupId, role, userId);
    if (exists) return;

    if (role === "assistantCoach") {
      const { error } = await supabase.from("trainingGroupCoach").insert({
        group: toDbNumericId(groupId),
        coach: userId,
        status: "pending",
      });

      if (error) {
        console.error("Error adding assistant coach to group:", error);
        throw toReadableError(error);
      }
      return;
    }

    const { error } = await supabase.from("trainingGroupAthlete").insert({
      group: toDbNumericId(groupId),
      athlete: userId,
      status: "pending",
    });

    if (error) {
      console.error("Error adding athlete to group:", error);
      throw toReadableError(error);
    }
  } catch (error) {
    console.error("Error adding training group member:", error);
    throw toReadableError(error);
  }
};

export const removeTrainingGroupMember = async (
  groupId: string,
  role: "assistantCoach" | "athlete",
  userId: string,
): Promise<void> => {
  try {
    if (role === "assistantCoach") {
      const { error } = await supabase
        .from("trainingGroupCoach")
        .delete()
        .eq("group", toDbNumericId(groupId))
        .eq("coach", userId);

      if (error) {
        console.error("Error removing assistant coach from group:", error);
        throw toReadableError(error);
      }
      return;
    }

    const { error } = await supabase
      .from("trainingGroupAthlete")
      .delete()
      .eq("group", toDbNumericId(groupId))
      .eq("athlete", userId);

    if (error) {
      console.error("Error removing athlete from group:", error);
      throw toReadableError(error);
    }
  } catch (error) {
    console.error("Error removing training group member:", error);
    throw toReadableError(error);
  }
};

export const deleteTrainingGroup = async (groupId: string): Promise<void> => {
  try {
    const numericGroupId = toDbNumericId(groupId);

    const { error: coachError } = await supabase
      .from("trainingGroupCoach")
      .delete()
      .eq("group", numericGroupId);

    if (coachError) {
      console.error("Error removing training group coaches:", coachError);
      throw toReadableError(coachError);
    }

    const { error: athleteError } = await supabase
      .from("trainingGroupAthlete")
      .delete()
      .eq("group", numericGroupId);

    if (athleteError) {
      console.error("Error removing training group athletes:", athleteError);
      throw toReadableError(athleteError);
    }

    const { error: groupError } = await supabase
      .from("trainingGroup")
      .delete()
      .eq("id", numericGroupId);

    if (groupError) {
      console.error("Error deleting training group:", groupError);
      throw toReadableError(groupError);
    }
  } catch (error) {
    console.error("Error deleting training group:", error);
    throw toReadableError(error);
  }
};

export const upsertScheduleModuleFeedback = async (
  input: UpsertScheduleModuleFeedbackInput,
): Promise<ScheduleModuleFeedbackRow> => {
  const formatted = formatFeedbackPayloadFromResponses(input.responses ?? []);
  const payload = {
    moduleId: toDbNumericId(input.moduleId),
    scheduleDayId: toDbNumericId(input.scheduleDayId),
    distance: formatted.distance,
    duration: formatted.duration,
    weight: formatted.weight,
    comment: formatted.comment,
    feeling: formatted.feeling,
    sleepHours: formatted.sleepHours,
  } satisfies Omit<DbScheduleModuleFeedbackRow, "id">;

  try {
    const { data, error } = await supabase
      .from("scheduleModuleFeedback")
      .upsert(payload, { onConflict: "moduleId,scheduleDayId" })
      .select("id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours")
      .single();

    if (error) {
      console.error("Error upserting schedule module feedback:", error);
      throw toReadableError(error);
    }

    const coerced = coerceScheduleModuleFeedbackRow({
      ...data,
      moduleId: data.moduleId ?? payload.moduleId,
      scheduleDayId: data.scheduleDayId ?? payload.scheduleDayId,
    } as DbScheduleModuleFeedbackRow);

    return { ...coerced, responses: input.responses ?? [] };
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
      .select("id,week,owner,athlete,title")
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
        .select("id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours")
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
      .select(moduleSelectColumns)
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
      .select("id,moduleId,scheduleDayId,distance,duration,weight,comment,feeling,sleepHours")
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
      .select("id,week,owner,athlete,title")
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
      .select("id,week,owner,athlete,title")
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
    description: input.description?.trim() || null,
    visibleToAllCoaches: Boolean(input.visibleToAllCoaches),
    activeFeedbackFields: Array.isArray(input.feedbackFields)
      ? input.feedbackFields
      : [],
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

export const updateModule = async (input: UpdateModuleInput): Promise<ModuleRow> => {
  const payload = {
    name: input.name,
    category: input.category,
    subCategory: input.subCategory?.trim() || null,
    description: input.description?.trim() || null,
    visibleToAllCoaches: input.visibleToAllCoaches,
    activeFeedbackFields: Array.isArray(input.feedbackFields)
      ? input.feedbackFields
      : [],
  } satisfies Partial<ModuleRow>;

  try {
    const { data, error } = await supabase
      .from("module")
      .update(payload)
      .eq("id", toDbNumericId(input.id))
      .select()
      .single();

    if (error) {
      console.error("Error updating module:", error);
      throw toReadableError(error);
    }

    return coerceModuleRow(data);
  } catch (error) {
    console.error("Error updating module via SQL query:", error);
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

const isPostgrestError = (error: unknown): error is PostgrestError =>
  Boolean(error) && typeof (error as PostgrestError).code === "string";

const isRlsInsertError = (error: unknown) => {
  if (!isPostgrestError(error)) return false;

  return (
    error.code === "42501" ||
    error.message?.toLowerCase().includes("row-level security") ||
    error.details?.toLowerCase().includes("row-level security")
  );
};

const resolveAccessToken = async (client: SupabaseClient = getSupabaseBrowserClient()) => {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  if (!sessionError && sessionData.session?.access_token) {
    return sessionData.session.access_token;
  }

  const { data: refreshedSession, error: refreshError } = await client.auth.refreshSession();

  if (refreshError) {
    console.error("Failed to refresh Supabase session for access token", refreshError);
    return null;
  }

  return refreshedSession.session?.access_token ?? null;
};

const persistUserWithServiceRole = async (input: CreateUserInput): Promise<AthleteRow> => {
  const accessToken = input.accessToken ?? (await resolveAccessToken());

  if (!accessToken) {
    throw new Error(
      "Unable to create user profile because no Supabase access token was provided to validate the request.",
    );
  }

  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: input.id,
      email: input.email,
      name: input.name,
      isCoach: Boolean(input.isCoach),
      accessToken,
    }),
  });

  if (!response.ok) {
    const errorMessage = (await response.text()) || response.statusText;
    throw new Error(errorMessage);
  }

  return (await response.json()) as AthleteRow;
};

export const createUser = async (
  input: CreateUserInput,
  client: SupabaseClient = supabase,
): Promise<AthleteRow> => {
  const payload = {
    id: input.id,
    name: input.name.trim(),
    email: input.email.trim(),
    isCoach: Boolean(input.isCoach),
  } satisfies AthleteRow;

  try {
    const { data, error } = await client.from("user").insert(payload).select().single();

    if (error) {
      console.error("Error creating user:", error);

      if (isRlsInsertError(error)) {
        return persistUserWithServiceRole(input);
      }

      throw toReadableError(error);
    }

    return data;
  } catch (error) {
    console.error("Error persisting user via SQL query:", error);

    if (isRlsInsertError(error)) {
      return persistUserWithServiceRole(input);
    }

    throw toReadableError(error);
  }
};

export const findUserByEmail = async (
  email: string,
  client: SupabaseClient = supabase,
): Promise<AthleteRow | null> => {
  console.log("Finding user by email:", email);

  try {
    const { data: user, error } = await client
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
  accessTokenOverride?: string | null,
): Promise<AthleteRow> => {
  if (!authUser.email) {
    throw new Error("Authenticated user is missing an email.");
  }

  const supabaseClient = getSupabaseBrowserClient();
  const accessToken = accessTokenOverride ?? (await resolveAccessToken(supabaseClient)) ?? undefined;

  const existingUser = await findUserByEmail(authUser.email, supabaseClient);
  if (existingUser) return existingUser;

  const nameFromMetadata =
    typeof authUser.user_metadata?.name === "string"
      ? authUser.user_metadata.name.trim()
      : "";

  const name = nameFromMetadata || authUser.email;
  const isCoach = Boolean(authUser.user_metadata?.isCoach);

  return createUser(
    {
      id: authUser.id,
      email: authUser.email,
      name,
      isCoach,
      accessToken,
    },
    supabaseClient,
  );
};
