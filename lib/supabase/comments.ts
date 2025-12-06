import { supabaseRequest } from "./client";

export type ModuleCommentRow = {
  id: string;
  moduleId: string;
  athleteId: string;
  coachId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export const getCommentsForModule = async (input: {
  moduleId: string;
  athleteId?: string;
}): Promise<ModuleCommentRow[]> => {
  const searchParams: Record<string, string> = {
    select: "id,moduleId,athleteId,coachId,body,createdAt,updatedAt",
    moduleId: `eq.${input.moduleId}`,
    order: "createdAt.asc",
  };

  if (input.athleteId) {
    searchParams.athleteId = `eq.${input.athleteId}`;
  }

  return supabaseRequest<ModuleCommentRow[]>("moduleComment", {
    searchParams,
  });
};

export const createModuleComment = async (input: {
  moduleId: string;
  athleteId: string;
  coachId: string;
  body: string;
}): Promise<ModuleCommentRow> => {
  const payload = {
    moduleId: input.moduleId,
    athleteId: input.athleteId,
    coachId: input.coachId,
    body: input.body.trim(),
  };

  const data = await supabaseRequest<ModuleCommentRow[]>("moduleComment", {
    method: "POST",
    body: payload,
    prefer: "return=representation",
  });

  return data[0];
};

export const updateModuleComment = async (
  commentId: string,
  updates: { body: string },
): Promise<ModuleCommentRow> => {
  const data = await supabaseRequest<ModuleCommentRow[]>("moduleComment", {
    method: "PATCH",
    searchParams: {
      id: `eq.${commentId}`,
    },
    body: {
      body: updates.body.trim(),
    },
    prefer: "return=representation",
  });

  return data[0];
};
