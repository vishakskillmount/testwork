import type { WorkbookComparison } from "./excel.types";
import { formatCellDisplay } from "./excel-display";

export type EvaluationAnswerCell = {
  sheet: string;
  grid: string;
  studentAddress: string | null;
  correctAddress: string | null;
  studentValue: string;
  correctValue: string;
  status: "match" | "different" | "student-only" | "correct-only";
};

export type EvaluationPayload = {
  studentName: string;
  correctName: string;
  summary: {
    matchCount: number;
    differentCount: number;
    studentOnlyCount: number;
    correctOnlyCount: number;
  };
  answers: EvaluationAnswerCell[];
};

export function toEvaluationPayload(comparison: WorkbookComparison): EvaluationPayload {
  const answers: EvaluationAnswerCell[] = [];

  for (const sheet of comparison.sheets) {
    for (const grid of sheet.grids) {
      for (const row of grid.cells) {
        for (const cell of row) {
          if (cell.status === "empty") {
            continue;
          }

          answers.push({
            sheet: sheet.name,
            grid: grid.name,
            studentAddress: cell.studentAddress,
            correctAddress: cell.correctAddress,
            studentValue: formatCellDisplay(cell.studentValue),
            correctValue: formatCellDisplay(cell.correctValue),
            status: cell.status,
          });
        }
      }
    }
  }

  return {
    studentName: comparison.studentName,
    correctName: comparison.correctName,
    summary: {
      matchCount: comparison.matchCount,
      differentCount: comparison.differentCount,
      studentOnlyCount: comparison.studentOnlyCount,
      correctOnlyCount: comparison.correctOnlyCount,
    },
    answers,
  };
}
