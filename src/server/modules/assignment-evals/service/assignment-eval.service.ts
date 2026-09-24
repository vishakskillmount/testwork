import type { LocalEvaluationResult } from "@/lib/excel/local-evaluation";
import type { AssignmentEvaluation } from "@/shared/types/assignment-eval.types";
import { assignmentEvalRepository } from "../repositories/assignment-eval.supabase.repository";

export const assignmentEvalService = {
  async save(result: LocalEvaluationResult): Promise<AssignmentEvaluation> {
    return assignmentEvalRepository.create({
      student_file_name: result.studentName,
      correct_file_name: result.correctName,
      total_answers: result.totalAnswers,
      wrong_answers: result.wrongAnswers,
      correct_answers: result.correctAnswers,
      message: result.message,
      method: "local",
      wrong_cells: result.mismatches,
      correct_cells: result.matches,
      created_at: new Date().toISOString(),
    });
  },
};
