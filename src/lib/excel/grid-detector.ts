import type { ExcelCellValue, ExcelGrid } from "./excel.types";

export function isEmptyCell(value: ExcelCellValue): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  return typeof value === "string" && value.trim() === "";
}

export function toA1Address(rowIndex: number, colIndex: number): string {
  return `${toColumnLetter(colIndex)}${rowIndex + 1}`;
}

export function toColumnLetter(colIndex: number): string {
  let remaining = colIndex;
  let letters = "";

  do {
    letters = String.fromCharCode((remaining % 26) + 65) + letters;
    remaining = Math.floor(remaining / 26) - 1;
  } while (remaining >= 0);

  return letters;
}

export function detectGrids(
  matrix: ExcelCellValue[][],
  sheetName: string,
): ExcelGrid[] {
  const padded = padMatrix(matrix);
  if (padded.length === 0 || padded[0].length === 0) {
    return [];
  }

  const rowBands = findContentBands(padded.length, (row) =>
    padded[row].some((cell) => !isEmptyCell(cell)),
  );

  const grids: ExcelGrid[] = [];

  for (const [rowStart, rowEnd] of rowBands) {
    const bandRows = padded.slice(rowStart, rowEnd + 1);
    const columnCount = bandRows[0]?.length ?? 0;
    const columnBands = findContentBands(columnCount, (col) =>
      bandRows.some((row) => !isEmptyCell(row[col])),
    );

    for (const [colStart, colEnd] of columnBands) {
      const cells = bandRows.map((row) => row.slice(colStart, colEnd + 1));
      const startAddress = toA1Address(rowStart, colStart);
      const endAddress = toA1Address(rowEnd, colEnd);
      const index = grids.length + 1;

      grids.push({
        id: `${sheetName}-grid-${index}`,
        name: `Grid ${index}`,
        sheetName,
        startAddress,
        endAddress,
        range: `${startAddress}:${endAddress}`,
        startRow: rowStart,
        startCol: colStart,
        rowCount: cells.length,
        columnCount: colEnd - colStart + 1,
        cells,
      });
    }
  }

  return grids;
}

function padMatrix(matrix: ExcelCellValue[][]): ExcelCellValue[][] {
  const columnCount = matrix.reduce(
    (max, row) => Math.max(max, row.length),
    0,
  );

  if (columnCount === 0) {
    return [];
  }

  return matrix.map((row) => {
    if (row.length === columnCount) {
      return row;
    }

    return [...row, ...Array<ExcelCellValue>(columnCount - row.length).fill(null)];
  });
}

function findContentBands(
  length: number,
  hasContent: (index: number) => boolean,
): Array<[number, number]> {
  const bands: Array<[number, number]> = [];
  let index = 0;

  while (index < length) {
    while (index < length && !hasContent(index)) {
      index += 1;
    }

    if (index >= length) {
      break;
    }

    const start = index;
    while (index < length && hasContent(index)) {
      index += 1;
    }

    bands.push([start, index - 1]);
  }

  return bands;
}
