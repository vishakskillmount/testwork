import { ApiError, toErrorResponse } from "@/server/http/api-error";
import type { LocalEvaluationResult } from "@/lib/excel/local-evaluation";
import { assignmentEvalService } from "../service/assignment-eval.service";

function isLocalEvaluationResult(value: unknown): value is LocalEvaluationResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as LocalEvaluationResult;
  return (
    typeof result.studentName === "string" &&
    typeof result.correctName === "string" &&
    typeof result.totalAnswers === "number" &&
    typeof result.wrongAnswers === "number" &&
    typeof result.correctAnswers === "number" &&
    Array.isArray(result.mismatches) &&
    Array.isArray(result.matches)
  );
}

export const assignmentEvalController = {
  async save(request: Request) {
    try {
      const payload = (await request.json()) as unknown;
      if (!isLocalEvaluationResult(payload)) {
        throw ApiError.badRequest("Evaluation data is invalid.");
      }

      return Response.json(await assignmentEvalService.save(payload), { status: 201 });
    } catch (error) {
      if (error instanceof SyntaxError) {
        return toErrorResponse(
          ApiError.badRequest("Evaluation data is invalid."),
          "Failed to save evaluation",
        );
      }

      return toErrorResponse(error, "Failed to save evaluation");
    }
  },
};
