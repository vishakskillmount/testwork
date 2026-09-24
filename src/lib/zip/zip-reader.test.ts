import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import * as XLSX from "xlsx";

import {
  isSupportedZipEntry,
  mergeWorkbooks,
  readZipWorkbook,
  toArrayBuffer,
} from "./zip-reader";

function workbookBytes(sheets: Record<string, Array<Array<string | number>>>) {
  const workbook = XLSX.utils.book_new();

  for (const [sheetName, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  }

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

describe("ZIP assignment files", () => {
  it("keeps Excel and PDF entries and skips macOS junk", () => {
    expect(isSupportedZipEntry("answers/student.xlsx")).toBe(true);
    expect(isSupportedZipEntry("correct.pdf")).toBe(true);
    expect(isSupportedZipEntry("__MACOSX/student.xlsx")).toBe(false);
    expect(isSupportedZipEntry("._hidden.xlsx")).toBe(false);
    expect(isSupportedZipEntry("notes.txt")).toBe(false);
  });

  it("prefixes sheet names when a ZIP has more than one file", () => {
    const merged = mergeWorkbooks("answers.zip", [
      {
        name: "math.xlsx",
        sheetCount: 1,
        gridCount: 1,
        sheets: [
          {
            name: "Sales",
            hidden: false,
            rowCount: 1,
            columnCount: 1,
            usedRange: "A1:A1",
            gridCount: 1,
            grids: [],
          },
        ],
      },
      {
        name: "science.pdf",
        sheetCount: 1,
        gridCount: 1,
        sheets: [
          {
            name: "Page 1",
            hidden: false,
            rowCount: 1,
            columnCount: 1,
            usedRange: "A1:A1",
            gridCount: 1,
            grids: [],
          },
        ],
      },
    ]);

    expect(merged.sheets.map((sheet) => sheet.name)).toEqual([
      "math / Sales",
      "science / Page 1",
    ]);
  });

  it("reads Excel files inside a ZIP", async () => {
    const zip = new JSZip();
    zip.file(
      "student.xlsx",
      workbookBytes({
        Sales: [
          ["Region", "Units"],
          ["North", 10],
        ],
      }),
    );

    const packed = await zip.generateAsync({ type: "uint8array" });
    const file = new File([toArrayBuffer(packed)], "student-answers.zip", {
      type: "application/zip",
    });

    const workbook = await readZipWorkbook(file);

    expect(workbook.name).toBe("student-answers.zip");
    expect(workbook.sheets[0].name).toBe("Sales");
    expect(workbook.sheets[0].grids[0].cells).toEqual([
      ["Region", "Units"],
      ["North", 10],
    ]);
  });
});
