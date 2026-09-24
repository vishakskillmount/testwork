import { getSupabaseClient } from "@/server/database/supabase.client";
import { ASSIGNMENT_EVALUATIONS_TABLE } from "@/shared/constants/database.constants";
import type { LocalMismatch } from "@/lib/excel/local-evaluation";

export type SupabaseAssignmentEvalRecord = {
  id?: string;
  student_file_name: string;
  correct_file_name: string;
  total_answers: number;
  wrong_answers: number;
  correct_answers: number;
  message: string;
  method: "local";
  wrong_cells: LocalMismatch[];
  correct_cells: LocalMismatch[];
  created_at: string;
};

export function supabaseAssignmentEvalModel() {
  return getSupabaseClient().from(ASSIGNMENT_EVALUATIONS_TABLE);
}
