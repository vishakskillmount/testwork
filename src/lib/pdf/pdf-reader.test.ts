import { describe, expect, it } from "vitest";

import { parsePdfPageToMatrix } from "./pdf-reader";

describe("PDF page parsing", () => {
  it("splits lines and spaced columns into a grid", () => {
    const matrix = parsePdfPageToMatrix(
      ["Region    Units", "North     10", "", "Note  Keep"].join("\n"),
    );

    expect(matrix).toEqual([
      ["Region", "Units"],
      ["North", "10"],
      ["Note", "Keep"],
    ]);
  });
});
