import type { LocalMismatch } from "@/lib/excel/local-evaluation";

export type AssignmentEvaluation = {
  id: string;
  studentFileName: string;
  correctFileName: string;
  totalAnswers: number;
  wrongAnswers: number;
  correctAnswers: number;
  message: string;
  method: "local";
  wrongCells: LocalMismatch[];
  correctCells: LocalMismatch[];
  createdAt: string;
};
