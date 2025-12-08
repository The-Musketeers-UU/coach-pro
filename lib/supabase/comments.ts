import { supabase } from "../supabase";

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
  try {
    let query = supabase
      .from("moduleComment")
      .select("id,moduleId,athleteId,coachId,body,createdAt,updatedAt")
      .eq("moduleId", input.moduleId)
      .order("createdAt", { ascending: true });

    if (input.athleteId) {
      query = query.eq("athleteId", input.athleteId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching module comments:", error);
      throw error;
    }

    return data ?? [];
  } catch (error) {
    console.error("Error retrieving module comments via SQL query:", error);
    throw error;
  }
};

export const createModuleComment = async (input: {
  moduleId: string;
  athleteId: string;
  coachId: string;
  body: string;
}): Promise<ModuleCommentRow> => {
  const timestamp = new Date().toISOString();
  const payload = {
    moduleId: input.moduleId,
    athleteId: input.athleteId,
    coachId: input.coachId,
    body: input.body.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    const { data, error } = await supabase
      .from("moduleComment")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Error creating module comment:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting module comment via SQL query:", error);
    throw error;
  }
};

export const updateModuleComment = async (
  commentId: string,
  updates: { body: string },
): Promise<ModuleCommentRow> => {
  const trimmedBody = updates.body.trim();
  const updatedAt = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("moduleComment")
      .update({ body: trimmedBody, updatedAt })
      .eq("id", commentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating module comment:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error persisting module comment update via SQL query:", error);
    throw error;
  }
};
