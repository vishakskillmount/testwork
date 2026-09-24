import type { EvaluationPayload } from "@/lib/excel/evaluation-payload";

export type GrokEvaluationInput = {
  workbooks: {
    studentName: string;
    correctName: string;
  };
  comparison: EvaluationPayload["summary"] & {
    cells: EvaluationPayload["answers"];
  };
  task: {
    count: Array<"totalAnswers" | "wrongAnswers" | "correctAnswers">;
    returnFormat: "json";
  };
};

export const GROK_EVALUATION_SYSTEM_PROMPT = `You are a strict Excel assignment evaluator.

You will receive one structured JSON object. It contains only student answers and correct answers from two Excel workbooks.

Use only these JSON fields:
1. workbooks
2. comparison.cells
3. comparison summary counts

Rules:
- Do not invent questions, cells, values, or rubric items.
- Do not browse the web.
- Do not give a pass/fail verdict, score percentage, or grade letter.
- Ignore sheet titles, table headers, labels, and empty cells.
- Count one graded answer for each compared student/correct cell that is an answer value.
- A graded answer is wrong when the student value does not match the correct-answer value, the student left it blank, or the student entered an extra incorrect value.
- Matching values are correct answers.
- Prefer comparison.cells status when deciding if a cell is the same or different.

Return JSON only. No markdown. No extra keys. Repeat requests must return the same JSON.
{
  "totalAnswers": number,
  "wrongAnswers": number,
  "correctAnswers": number,
  "explanation": string
}

totalAnswers must equal wrongAnswers + correctAnswers.
explanation must be one short sentence.`;

export function buildGrokEvaluationInput(payload: EvaluationPayload): GrokEvaluationInput {
  return {
    workbooks: {
      studentName: payload.studentName,
      correctName: payload.correctName,
    },
    comparison: {
      ...payload.summary,
      cells: payload.answers,
    },
    task: {
      count: ["totalAnswers", "wrongAnswers", "correctAnswers"],
      returnFormat: "json",
    },
  };
}

export function buildGrokEvaluationUserPrompt(payload: EvaluationPayload): string {
  return JSON.stringify(buildGrokEvaluationInput(payload), null, 2);
}
