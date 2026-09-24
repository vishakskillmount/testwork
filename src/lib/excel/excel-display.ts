import type { ExcelCellValue } from "./excel.types";
import { isEmptyCell } from "./grid-detector";

export function formatCellDisplay(value: ExcelCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  return String(value);
}

export function cellsEqual(left: ExcelCellValue, right: ExcelCellValue): boolean {
  if (isEmptyCell(left) && isEmptyCell(right)) {
    return true;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left === right;
  }

  return formatCellDisplay(left) === formatCellDisplay(right);
}
