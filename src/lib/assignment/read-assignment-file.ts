import { isExcelFile, isPdfFile, isZipFile } from "@/lib/assignment/assignment-file-types";
import { readExcelWorkbook } from "@/lib/excel/excel-reader";
import type { ExcelWorkbook } from "@/lib/excel/excel.types";
import { readPdfWorkbook } from "@/lib/pdf/pdf-reader";
import { readZipWorkbook } from "@/lib/zip/zip-reader";

export { isExcelFile, isPdfFile, isZipFile };

export async function readAssignmentFile(file: File): Promise<ExcelWorkbook> {
  if (isZipFile(file)) {
    return readZipWorkbook(file);
  }

  if (isPdfFile(file)) {
    return readPdfWorkbook(file);
  }

  if (isExcelFile(file)) {
    return readExcelWorkbook(file);
  }

  throw new Error("Upload an Excel (.xlsx, .xls), PDF (.pdf), or ZIP (.zip) file.");
}
