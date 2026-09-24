import {
  GROK_EVALUATION_SYSTEM_PROMPT,
  buildGrokEvaluationUserPrompt,
} from "@/lib/ai/evaluation-prompt";
import { evaluateWithGrok } from "@/lib/ai/grok-client";
import type { EvaluationPayload } from "@/lib/excel/evaluation-payload";
import { ApiError } from "@/server/http/api-error";
import type { ExcelEvaluationResult } from "@/shared/types/excel-eval.types";

export const excelEvalService = {
  async evaluate(payload: EvaluationPayload): Promise<ExcelEvaluationResult> {
    if (payload.answers.length === 0) {
      throw ApiError.badRequest("Compare both Excel files before evaluating.");
    }

    return evaluateWithGrok(
      GROK_EVALUATION_SYSTEM_PROMPT,
      buildGrokEvaluationUserPrompt(payload),
    );
  },
};
