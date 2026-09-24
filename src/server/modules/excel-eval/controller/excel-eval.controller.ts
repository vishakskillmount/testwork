import { ApiError, toErrorResponse } from "@/server/http/api-error";
import type { EvaluationPayload } from "@/lib/excel/evaluation-payload";
import { excelEvalService } from "../service/excel-eval.service";

function isEvaluationPayload(value: unknown): value is EvaluationPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as EvaluationPayload;
  return (
    typeof payload.studentName === "string" &&
    typeof payload.correctName === "string" &&
    Array.isArray(payload.answers) &&
    Boolean(payload.summary)
  );
}

export const excelEvalController = {
  async evaluate(request: Request) {
    try {
      const payload = (await request.json()) as unknown;
      if (!isEvaluationPayload(payload)) {
        throw ApiError.badRequest("Comparison data is invalid.");
      }

      return Response.json(await excelEvalService.evaluate(payload));
    } catch (error) {
      if (error instanceof SyntaxError) {
        return toErrorResponse(
          ApiError.badRequest("Comparison data is invalid."),
          "Failed to evaluate assignment",
        );
      }

      return toErrorResponse(error, "Failed to evaluate assignment");
    }
  },
};
