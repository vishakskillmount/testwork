export type ExcelCellValue = string | number | boolean | Date | null;

export type ExcelGrid = {
  id: string;
  name: string;
  sheetName: string;
  range: string;
  startAddress: string;
  endAddress: string;
  startRow: number;
  startCol: number;
  rowCount: number;
  columnCount: number;
  cells: ExcelCellValue[][];
};

export type ExcelSheet = {
  name: string;
  hidden: boolean;
  rowCount: number;
  columnCount: number;
  usedRange: string | null;
  gridCount: number;
  grids: ExcelGrid[];
};

export type ExcelWorkbook = {
  name: string;
  sheetCount: number;
  gridCount: number;
  sheets: ExcelSheet[];
};

export type CellCompareStatus =
  | "match"
  | "different"
  | "student-only"
  | "correct-only"
  | "empty";

export type ComparedCell = {
  row: number;
  col: number;
  studentAddress: string | null;
  correctAddress: string | null;
  studentValue: ExcelCellValue;
  correctValue: ExcelCellValue;
  status: CellCompareStatus;
};

export type ComparedGrid = {
  name: string;
  studentGrid: ExcelGrid | null;
  correctGrid: ExcelGrid | null;
  rowCount: number;
  columnCount: number;
  cells: ComparedCell[][];
  matchCount: number;
  differentCount: number;
  studentOnlyCount: number;
  correctOnlyCount: number;
};

export type ComparedSheet = {
  name: string;
  studentSheet: ExcelSheet | null;
  correctSheet: ExcelSheet | null;
  grids: ComparedGrid[];
  matchCount: number;
  differentCount: number;
  studentOnlyCount: number;
  correctOnlyCount: number;
};

export type WorkbookComparison = {
  studentName: string;
  correctName: string;
  sheets: ComparedSheet[];
  matchCount: number;
  differentCount: number;
  studentOnlyCount: number;
  correctOnlyCount: number;
};
