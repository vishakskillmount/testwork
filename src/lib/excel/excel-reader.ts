import * as XLSX from "xlsx";

import type { ExcelCellValue, ExcelSheet, ExcelWorkbook } from "./excel.types";
import { detectGrids } from "./grid-detector";

const WORKBOOK_READ_OPTIONS: XLSX.ParsingOptions = {
  type: "array",
  cellDates: true,
  cellNF: true,
  cellText: false,
  raw: true,
};

export async function readExcelWorkbook(file: File): Promise<ExcelWorkbook> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, WORKBOOK_READ_OPTIONS);
  const sheets = workbook.SheetNames.map((sheetName) =>
    readSheet(workbook, sheetName),
  );

  return {
    name: file.name,
    sheetCount: sheets.length,
    gridCount: sheets.reduce((total, sheet) => total + sheet.gridCount, 0),
    sheets,
  };
}

function readSheet(workbook: XLSX.WorkBook, sheetName: string): ExcelSheet {
  const worksheet = workbook.Sheets[sheetName];
  const matrix = worksheetToMatrix(worksheet);
  const grids = detectGrids(matrix, sheetName);
  const usedRange = worksheet?.["!ref"] ?? null;
  const decoded = usedRange ? XLSX.utils.decode_range(usedRange) : null;

  return {
    name: sheetName,
    hidden: isSheetHidden(workbook, sheetName),
    rowCount: decoded ? decoded.e.r + 1 : matrix.length,
    columnCount: decoded ? decoded.e.c + 1 : (matrix[0]?.length ?? 0),
    usedRange,
    gridCount: grids.length,
    grids,
  };
}

function worksheetToMatrix(worksheet: XLSX.WorkSheet | undefined): ExcelCellValue[][] {
  if (!worksheet?.["!ref"]) {
    return [];
  }

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const matrix: ExcelCellValue[][] = [];

  for (let row = 0; row <= range.e.r; row += 1) {
    const cells: ExcelCellValue[] = [];

    for (let col = 0; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      cells.push(extractCellValue(worksheet[address]));
    }

    matrix.push(cells);
  }

  return matrix;
}

function extractCellValue(cell: XLSX.CellObject | undefined): ExcelCellValue {
  if (!cell) {
    return null;
  }

  if (cell.v instanceof Date) {
    return cell.v;
  }

  if (
    typeof cell.v === "string" ||
    typeof cell.v === "number" ||
    typeof cell.v === "boolean"
  ) {
    return cell.v;
  }

  if (cell.v !== undefined && cell.v !== null) {
    return String(cell.v);
  }

  if (typeof cell.f === "string" && cell.f.length > 0) {
    return `=${cell.f}`;
  }

  return null;
}

function isSheetHidden(workbook: XLSX.WorkBook, sheetName: string): boolean {
  const meta = workbook.Workbook?.Sheets?.find((sheet) => sheet.name === sheetName);
  return meta?.Hidden === 1 || meta?.Hidden === 2;
}
