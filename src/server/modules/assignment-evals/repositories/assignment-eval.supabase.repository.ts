import { toIsoString } from "@/shared/utils/date.util";
import { ApiError } from "@/server/http/api-error";
import type { AssignmentEvaluation } from "@/shared/types/assignment-eval.types";
import {
  supabaseAssignmentEvalModel,
  type SupabaseAssignmentEvalRecord,
} from "../models/assignment-eval.supabase.model";

const PERMISSION_HINT =
  "Supabase denied this change. Run supabase/assignment-evaluations.sql in the Supabase SQL editor, then try again.";

function throwIfSupabaseError(error: { message?: string } | null) {
  if (!error) {
    return;
  }

  const message = error.message ?? "Supabase request failed.";
  if (message.toLowerCase().includes("permission denied") || message.toLowerCase().includes("could not find")) {
    throw ApiError.internal(PERMISSION_HINT);
  }

  throw ApiError.internal(message);
}

function mapRecord(row: SupabaseAssignmentEvalRecord): AssignmentEvaluation {
  return {
    id: String(row.id ?? ""),
    studentFileName: row.student_file_name,
    correctFileName: row.correct_file_name,
    totalAnswers: row.total_answers,
    wrongAnswers: row.wrong_answers,
    correctAnswers: row.correct_answers,
    message: row.message,
    method: "local",
    wrongCells: row.wrong_cells ?? [],
    correctCells: row.correct_cells ?? [],
    createdAt: toIsoString(row.created_at),
  };
}

export const assignmentEvalRepository = {
  async create(row: Omit<SupabaseAssignmentEvalRecord, "id">): Promise<AssignmentEvaluation> {
    const { data, error } = await supabaseAssignmentEvalModel()
      .insert(row)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    return mapRecord((data as SupabaseAssignmentEvalRecord | null) ?? row);
  },
};
