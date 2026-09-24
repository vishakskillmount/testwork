import { API_ROUTES } from "@/shared/constants/api.constants";
import type { EvaluationPayload } from "@/lib/excel/evaluation-payload";
import type { ExcelEvaluationResult } from "@/shared/types/excel-eval.types";

export async function evaluateExcelAssignment(
  comparison: EvaluationPayload,
): Promise<ExcelEvaluationResult> {
  const response = await fetch(API_ROUTES.EXCEL_EVAL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(comparison),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error ?? "Failed to evaluate assignment");
  }

  return data as ExcelEvaluationResult;
}
