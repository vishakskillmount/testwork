import { describe, expect, it } from "vitest";

import type { ComparedCell, WorkbookComparison } from "./excel.types";
import {
  cellsEqualIgnoreCase,
  describeDifference,
  evaluateWithoutAi,
} from "./local-evaluation";

function cell(
  address: string,
  studentValue: ComparedCell["studentValue"],
  correctValue: ComparedCell["correctValue"],
): ComparedCell {
  return {
    row: 0,
    col: 0,
    studentAddress: address,
    correctAddress: address,
    studentValue,
    correctValue,
    status: "different",
  };
}

function comparison(cells: ComparedCell[]): WorkbookComparison {
  return {
    studentName: "student.xlsx",
    correctName: "answer-key.xlsx",
    matchCount: 0,
    differentCount: 0,
    studentOnlyCount: 0,
    correctOnlyCount: 0,
    sheets: [
      {
        name: "Sorted",
        studentSheet: null,
        correctSheet: null,
        matchCount: 0,
        differentCount: 0,
        studentOnlyCount: 0,
        correctOnlyCount: 0,
        grids: [
          {
            name: "Grid 1",
            studentGrid: null,
            correctGrid: null,
            rowCount: 1,
            columnCount: cells.length,
            cells: [cells],
            matchCount: 0,
            differentCount: 0,
            studentOnlyCount: 0,
            correctOnlyCount: 0,
          },
        ],
      },
    ],
  };
}

describe("evaluateWithoutAi", () => {
  it("compares cells case-insensitively like the Excel macro", () => {
    expect(cellsEqualIgnoreCase("North", "NORTH")).toBe(true);
    expect(cellsEqualIgnoreCase("  Yes ", "yes")).toBe(true);
    expect(cellsEqualIgnoreCase("9", 9)).toBe(true);
    expect(cellsEqualIgnoreCase("9", "8")).toBe(false);
  });

  it("ignores spaces, punctuation, and letter case", () => {
    expect(
      cellsEqualIgnoreCase(
        "Being cash paid for  mo  to graphic\ninr 600",
        "Being cash paid for mo to graphic inr 600",
      ),
    ).toBe(true);
    expect(cellsEqualIgnoreCase("Hello, World 1", "helloworld1")).toBe(true);
    expect(
      cellsEqualIgnoreCase(
        "Govt Charges = 350 , M-Post 15",
        "Govt Charges = 35050 , M-Post 15",
      ),
    ).toBe(false);
    expect(describeDifference("28333/36=69.6999", "28333/36=78.6999")).toContain(
      "696999",
    );
  });

  it("counts differences and matching answers", () => {
    const result = evaluateWithoutAi(
      comparison([
        cell("C4", "North", "NORTH"),
        cell("D4", 9, 8),
        cell("H4", "", "Keep"),
        cell("C5", null, null),
      ]),
    );

    expect(result.totalAnswers).toBe(3);
    expect(result.correctAnswers).toBe(1);
    expect(result.wrongAnswers).toBe(2);
    expect(result.message).toBe("2 differences found in student.xlsx");
    expect(result.mismatches.map((item) => item.address)).toEqual(["D4", "H4"]);
    expect(result.matches.map((item) => item.address)).toEqual(["C4"]);
  });

  it("reports no differences when every graded cell matches", () => {
    const result = evaluateWithoutAi(comparison([cell("C4", "done", "DONE")]));

    expect(result.wrongAnswers).toBe(0);
    expect(result.message).toBe("No differences found in student.xlsx");
  });
});
