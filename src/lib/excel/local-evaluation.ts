import { formatCellDisplay } from "./excel-display";
import type { ExcelCellValue, WorkbookComparison } from "./excel.types";
import { isEmptyCell } from "./grid-detector";

export type LocalMismatch = {
  sheet: string;
  address: string;
  studentValue: string;
  correctValue: string;
  difference: string | null;
};

export type LocalEvaluationResult = {
  totalAnswers: number;
  wrongAnswers: number;
  correctAnswers: number;
  studentName: string;
  correctName: string;
  mismatches: LocalMismatch[];
  matches: LocalMismatch[];
  message: string;
};

export function evaluateWithoutAi(comparison: WorkbookComparison): LocalEvaluationResult {
  const mismatches: LocalMismatch[] = [];
  const matches: LocalMismatch[] = [];

  for (const sheet of comparison.sheets) {
    for (const grid of sheet.grids) {
      for (const row of grid.cells) {
        for (const cell of row) {
          if (isEmptyCell(cell.studentValue) && isEmptyCell(cell.correctValue)) {
            continue;
          }

          const studentValue = formatCellDisplay(cell.studentValue);
          const correctValue = formatCellDisplay(cell.correctValue);
          const detail: LocalMismatch = {
            sheet: sheet.name,
            address: cell.studentAddress ?? cell.correctAddress ?? "",
            studentValue,
            correctValue,
            difference: describeDifference(studentValue, correctValue),
          };

          if (cellsEqualIgnoreCase(cell.studentValue, cell.correctValue)) {
            matches.push(detail);
          } else {
            mismatches.push(detail);
          }
        }
      }
    }
  }

  return {
    totalAnswers: matches.length + mismatches.length,
    wrongAnswers: mismatches.length,
    correctAnswers: matches.length,
    studentName: comparison.studentName,
    correctName: comparison.correctName,
    mismatches,
    matches,
    message:
      mismatches.length > 0
        ? `${mismatches.length} differences found in ${comparison.studentName}`
        : `No differences found in ${comparison.studentName}`,
  };
}

export function cellsEqualIgnoreCase(left: ExcelCellValue, right: ExcelCellValue): boolean {
  return normalizeCellText(formatCellDisplay(left)) === normalizeCellText(formatCellDisplay(right));
}

export function describeDifference(studentValue: string, correctValue: string): string | null {
  const student = normalizeCellText(studentValue);
  const correct = normalizeCellText(correctValue);
  if (student === correct) {
    return null;
  }

  let index = 0;
  const limit = Math.min(student.length, correct.length);
  while (index < limit && student[index] === correct[index]) {
    index += 1;
  }

  const start = Math.max(0, index - 14);
  const studentBit = student.slice(start, index + 18) || "(empty)";
  const correctBit = correct.slice(start, index + 18) || "(empty)";
  return `${studentBit}  →  ${correctBit}`;
}

export function normalizeCellText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}
