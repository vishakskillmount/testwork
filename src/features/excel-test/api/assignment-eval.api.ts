import { API_ROUTES } from "@/shared/constants/api.constants";
import type { LocalEvaluationResult } from "@/lib/excel/local-evaluation";
import type { AssignmentEvaluation } from "@/shared/types/assignment-eval.types";

export async function saveAssignmentEvaluation(
  result: LocalEvaluationResult,
): Promise<AssignmentEvaluation> {
  const response = await fetch(API_ROUTES.ASSIGNMENT_EVALS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error ?? "Failed to save evaluation");
  }

  return data as AssignmentEvaluation;
}
