import type {
  ComparedGrid,
  ComparedSheet,
  ExcelCellValue,
  ExcelGrid,
  ExcelSheet,
  ExcelWorkbook,
  WorkbookComparison,
} from "./excel.types";
import { cellsEqual } from "./excel-display";
import { isEmptyCell, toA1Address } from "./grid-detector";

export function compareWorkbooks(
  student: ExcelWorkbook,
  correct: ExcelWorkbook,
): WorkbookComparison {
  const sheets = pairSheets(student.sheets, correct.sheets).map(([studentSheet, correctSheet]) =>
    compareSheets(studentSheet, correctSheet),
  );

  return {
    studentName: student.name,
    correctName: correct.name,
    sheets,
    matchCount: sum(sheets, (sheet) => sheet.matchCount),
    differentCount: sum(sheets, (sheet) => sheet.differentCount),
    studentOnlyCount: sum(sheets, (sheet) => sheet.studentOnlyCount),
    correctOnlyCount: sum(sheets, (sheet) => sheet.correctOnlyCount),
  };
}

function compareSheets(
  studentSheet: ExcelSheet | null,
  correctSheet: ExcelSheet | null,
): ComparedSheet {
  const grids = pairGrids(studentSheet?.grids ?? [], correctSheet?.grids ?? []).map(
    ([studentGrid, correctGrid], index) =>
      compareGrids(studentGrid, correctGrid, index + 1),
  );

  return {
    name: studentSheet?.name ?? correctSheet?.name ?? "Untitled sheet",
    studentSheet,
    correctSheet,
    grids,
    matchCount: sum(grids, (grid) => grid.matchCount),
    differentCount: sum(grids, (grid) => grid.differentCount),
    studentOnlyCount: sum(grids, (grid) => grid.studentOnlyCount),
    correctOnlyCount: sum(grids, (grid) => grid.correctOnlyCount),
  };
}

function compareGrids(
  studentGrid: ExcelGrid | null,
  correctGrid: ExcelGrid | null,
  index: number,
): ComparedGrid {
  const rowCount = Math.max(studentGrid?.rowCount ?? 0, correctGrid?.rowCount ?? 0);
  const columnCount = Math.max(studentGrid?.columnCount ?? 0, correctGrid?.columnCount ?? 0);
  const cells: ComparedGrid["cells"] = [];
  let matchCount = 0;
  let differentCount = 0;
  let studentOnlyCount = 0;
  let correctOnlyCount = 0;

  for (let row = 0; row < rowCount; row += 1) {
    const comparedRow: ComparedGrid["cells"][number] = [];

    for (let col = 0; col < columnCount; col += 1) {
      const studentValue = cellAt(studentGrid, row, col);
      const correctValue = cellAt(correctGrid, row, col);
      const studentPresent = isInsideGrid(studentGrid, row, col);
      const correctPresent = isInsideGrid(correctGrid, row, col);
      const studentEmpty = !studentPresent || isEmptyCell(studentValue);
      const correctEmpty = !correctPresent || isEmptyCell(correctValue);

      let status: ComparedGrid["cells"][number][number]["status"] = "empty";

      if (studentEmpty && correctEmpty) {
        status = "empty";
      } else if (studentEmpty) {
        status = "correct-only";
        correctOnlyCount += 1;
      } else if (correctEmpty) {
        status = "student-only";
        studentOnlyCount += 1;
      } else if (cellsEqual(studentValue, correctValue)) {
        status = "match";
        matchCount += 1;
      } else {
        status = "different";
        differentCount += 1;
      }

      comparedRow.push({
        row,
        col,
        studentAddress: studentPresent && studentGrid
          ? toA1Address(studentGrid.startRow + row, studentGrid.startCol + col)
          : null,
        correctAddress: correctPresent && correctGrid
          ? toA1Address(correctGrid.startRow + row, correctGrid.startCol + col)
          : null,
        studentValue,
        correctValue,
        status,
      });
    }

    cells.push(comparedRow);
  }

  return {
    name: studentGrid?.name ?? correctGrid?.name ?? `Grid ${index}`,
    studentGrid,
    correctGrid,
    rowCount,
    columnCount,
    cells,
    matchCount,
    differentCount,
    studentOnlyCount,
    correctOnlyCount,
  };
}

function pairSheets(
  studentSheets: ExcelSheet[],
  correctSheets: ExcelSheet[],
): Array<[ExcelSheet | null, ExcelSheet | null]> {
  const remainingCorrect = [...correctSheets];
  const pairs: Array<[ExcelSheet | null, ExcelSheet | null]> = [];

  for (const studentSheet of studentSheets) {
    const matchIndex = remainingCorrect.findIndex((sheet) => sheet.name === studentSheet.name);
    if (matchIndex >= 0) {
      pairs.push([studentSheet, remainingCorrect.splice(matchIndex, 1)[0]]);
    } else {
      pairs.push([studentSheet, null]);
    }
  }

  for (const correctSheet of remainingCorrect) {
    pairs.push([null, correctSheet]);
  }

  return pairs;
}

function pairGrids(
  studentGrids: ExcelGrid[],
  correctGrids: ExcelGrid[],
): Array<[ExcelGrid | null, ExcelGrid | null]> {
  const remainingStudent = [...studentGrids];
  const remainingCorrect = [...correctGrids];
  const pairs: Array<[ExcelGrid | null, ExcelGrid | null]> = [];

  takeMatches(remainingStudent, remainingCorrect, pairs, (student, correct) => student.range === correct.range);
  takeMatches(
    remainingStudent,
    remainingCorrect,
    pairs,
    (student, correct) =>
      student.startRow === correct.startRow && student.startCol === correct.startCol,
  );

  const leftover = Math.max(remainingStudent.length, remainingCorrect.length);
  for (let index = 0; index < leftover; index += 1) {
    pairs.push([remainingStudent[index] ?? null, remainingCorrect[index] ?? null]);
  }

  return pairs;
}

function takeMatches(
  remainingStudent: ExcelGrid[],
  remainingCorrect: ExcelGrid[],
  pairs: Array<[ExcelGrid | null, ExcelGrid | null]>,
  isMatch: (student: ExcelGrid, correct: ExcelGrid) => boolean,
) {
  for (let studentIndex = 0; studentIndex < remainingStudent.length; ) {
    const studentGrid = remainingStudent[studentIndex];
    const correctIndex = remainingCorrect.findIndex((grid) => isMatch(studentGrid, grid));

    if (correctIndex >= 0) {
      pairs.push([studentGrid, remainingCorrect.splice(correctIndex, 1)[0]]);
      remainingStudent.splice(studentIndex, 1);
    } else {
      studentIndex += 1;
    }
  }
}

function cellAt(grid: ExcelGrid | null, row: number, col: number): ExcelCellValue {
  if (!isInsideGrid(grid, row, col) || !grid) {
    return null;
  }

  return grid.cells[row][col];
}

function isInsideGrid(grid: ExcelGrid | null, row: number, col: number): boolean {
  return Boolean(grid && row < grid.rowCount && col < grid.columnCount);
}

function sum<T>(items: T[], read: (item: T) => number): number {
  return items.reduce((total, item) => total + read(item), 0);
}
