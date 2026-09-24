import { readExcelWorkbook } from "@/lib/excel/excel-reader";
import type { ExcelWorkbook } from "@/lib/excel/excel.types";
import { readPdfWorkbook } from "@/lib/pdf/pdf-reader";

const EXCEL_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".xlsb"];

export async function readAssignmentFile(file: File): Promise<ExcelWorkbook> {
  if (isPdfFile(file)) {
    return readPdfWorkbook(file);
  }

  if (isExcelFile(file)) {
    return readExcelWorkbook(file);
  }

  throw new Error("Upload an Excel (.xlsx, .xls) or PDF (.pdf) file.");
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.includes("spreadsheet") ||
    file.type === "application/vnd.ms-excel" ||
    EXCEL_EXTENSIONS.some((extension) => name.endsWith(extension))
  );
}
