import { extractText } from "unpdf";

import type { ExcelCellValue, ExcelSheet, ExcelWorkbook } from "@/lib/excel/excel.types";
import { detectGrids } from "@/lib/excel/grid-detector";

export async function readPdfWorkbook(file: File): Promise<ExcelWorkbook> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const extracted = await extractText(bytes, { mergePages: false });
  const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
  const sheets = pages.map((pageText, index) =>
    pageToSheet(pageText ?? "", `Page ${index + 1}`),
  );

  if (sheets.every((sheet) => sheet.gridCount === 0)) {
    throw new Error("The PDF did not contain any readable text.");
  }

  return {
    name: file.name,
    sheetCount: sheets.length,
    gridCount: sheets.reduce((total, sheet) => total + sheet.gridCount, 0),
    sheets,
  };
}

export function parsePdfPageToMatrix(pageText: string): ExcelCellValue[][] {
  return pageText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .split(/\t+|\s{2,}/)
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0),
    );
}

function pageToSheet(pageText: string, sheetName: string): ExcelSheet {
  const matrix = parsePdfPageToMatrix(pageText);
  const grids = detectGrids(matrix, sheetName);
  const rowCount = matrix.length;
  const columnCount = matrix.reduce((max, row) => Math.max(max, row.length), 0);

  return {
    name: sheetName,
    hidden: false,
    rowCount,
    columnCount,
    usedRange: rowCount && columnCount ? `A1:${columnLetter(columnCount - 1)}${rowCount}` : null,
    gridCount: grids.length,
    grids,
  };
}

function columnLetter(colIndex: number): string {
  let remaining = colIndex;
  let letters = "";

  do {
    letters = String.fromCharCode((remaining % 26) + 65) + letters;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);

  return letters;
}
