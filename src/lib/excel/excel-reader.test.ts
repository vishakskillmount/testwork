import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { compareWorkbooks } from "./excel-compare";
import { readExcelWorkbook } from "./excel-reader";
import { detectGrids, toA1Address } from "./grid-detector";

function workbookFile(name: string, sheets: Record<string, Array<Array<string | number | boolean | null>>>) {
  const workbook = XLSX.utils.book_new();

  for (const [sheetName, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  }

  const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([bytes], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

describe("excel extraction", () => {
  it("detects separate grids without hardcoded ranges", () => {
    const grids = detectGrids(
      [
        ["Region", "Units", null, "City"],
        ["North", 10, null, "NYC"],
        [null, null, null, null],
        ["Note", "Keep"],
      ],
      "Sales",
    );

    expect(grids).toHaveLength(3);
    expect(grids.map((grid) => grid.range)).toEqual(["A1:B2", "D1:D2", "A4:B4"]);
    expect(grids[0].cells).toEqual([
      ["Region", "Units"],
      ["North", 10],
    ]);
  });

  it("reads every sheet and preserves cell values", async () => {
    const file = workbookFile("student-answer.xlsx", {
      Sales: [
        ["Region", "Units"],
        ["North", 10],
      ],
      Inventory: [
        [null, "SKU", "Qty"],
        [null, "A-1", 4],
      ],
      Empty: [],
    });

    const workbook = await readExcelWorkbook(file);

    expect(workbook.name).toBe("student-answer.xlsx");
    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual([
      "Sales",
      "Inventory",
      "Empty",
    ]);
    expect(workbook.sheets[0].grids[0].cells).toEqual([
      ["Region", "Units"],
      ["North", 10],
    ]);
    expect(workbook.sheets[1].grids[0].range).toBe("B1:C2");
    expect(workbook.sheets[2].grids).toEqual([]);
  });

  it("encodes Excel addresses from zero-based indexes", () => {
    expect(toA1Address(0, 0)).toBe("A1");
    expect(toA1Address(1, 27)).toBe("AB2");
  });

  it("compares paired sheets and highlights different cells", async () => {
    const student = await readExcelWorkbook(
      workbookFile("student-answer.xlsx", {
        Sales: [
          ["Region", "Units"],
          ["North", 10],
          ["South", 9],
        ],
      }),
    );
    const correct = await readExcelWorkbook(
      workbookFile("correct-answer.xlsx", {
        Sales: [
          ["Region", "Units"],
          ["North", 10],
          ["South", 8],
        ],
      }),
    );

    const comparison = compareWorkbooks(student, correct);
    const cells = comparison.sheets[0].grids[0].cells.flat();
    const different = cells.filter((cell) => cell.status === "different");

    expect(comparison.sheets[0].name).toBe("Sales");
    expect(different).toHaveLength(1);
    expect(different[0].studentValue).toBe(9);
    expect(different[0].correctValue).toBe(8);
  });
});
