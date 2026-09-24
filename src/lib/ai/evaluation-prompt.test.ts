import { describe, expect, it } from "vitest";

import { parseEvaluationResult } from "./grok-client";
import {
  GROK_EVALUATION_SYSTEM_PROMPT,
  buildGrokEvaluationUserPrompt,
} from "./evaluation-prompt";

describe("Grok evaluation prompt", () => {
  it("asks for total and wrong answer counts without pass/fail", () => {
    expect(GROK_EVALUATION_SYSTEM_PROMPT).toContain("totalAnswers");
    expect(GROK_EVALUATION_SYSTEM_PROMPT).toContain("wrongAnswers");
    expect(GROK_EVALUATION_SYSTEM_PROMPT).toContain("Do not give a pass/fail verdict");
    expect(GROK_EVALUATION_SYSTEM_PROMPT).toContain("Return JSON only");
    expect(GROK_EVALUATION_SYSTEM_PROMPT).toContain("student answers and correct answers");
  });

  it("sends only student and correct Excel JSON", () => {
    const prompt = buildGrokEvaluationUserPrompt({
      studentName: "student.xlsx",
      correctName: "correct.xlsx",
      summary: {
        matchCount: 1,
        differentCount: 1,
        studentOnlyCount: 0,
        correctOnlyCount: 0,
      },
      answers: [
        {
          sheet: "Sales",
          grid: "Grid 1",
          studentAddress: "B3",
          correctAddress: "B3",
          studentValue: "9",
          correctValue: "8",
          status: "different",
        },
      ],
    });

    const body = JSON.parse(prompt) as {
      workbooks: { studentName: string; correctName: string };
      comparison: { cells: Array<{ studentValue: string; correctValue: string }> };
    };

    expect(body.workbooks.studentName).toBe("student.xlsx");
    expect(body.workbooks.correctName).toBe("correct.xlsx");
    expect(body.comparison.cells[0].studentValue).toBe("9");
    expect(body.comparison.cells[0].correctValue).toBe("8");
    expect(prompt).not.toContain("assignmentPdf");
    expect(prompt).not.toContain("embedding");
    expect(prompt).not.toContain("vector");
  });

  it("parses Grok JSON counts", () => {
    const result = parseEvaluationResult(
      '```json\n{"totalAnswers":4,"wrongAnswers":1,"correctAnswers":3,"explanation":"One units cell is wrong."}\n```',
    );

    expect(result.totalAnswers).toBe(4);
    expect(result.wrongAnswers).toBe(1);
    expect(result.correctAnswers).toBe(3);
  });

  it("parses JSON wrapped in reasoning text", () => {
    const result = parseEvaluationResult(
      'Thinking about cells.\n{"totalAnswers":2,"wrongAnswers":1,"correctAnswers":1,"explanation":"One mismatch."}\nDone.',
    );

    expect(result.totalAnswers).toBe(2);
    expect(result.wrongAnswers).toBe(1);
    expect(result.correctAnswers).toBe(1);
  });
});
