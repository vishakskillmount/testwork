"use client";

import Link from "next/link";
import { useState } from "react";

import { readAssignmentFile } from "@/lib/assignment/read-assignment-file";
import { compareWorkbooks } from "@/lib/excel/excel-compare";
import { toEvaluationPayload } from "@/lib/excel/evaluation-payload";
import type { ExcelWorkbook, WorkbookComparison } from "@/lib/excel/excel.types";
import {
  evaluateWithoutAi,
  type LocalEvaluationResult,
} from "@/lib/excel/local-evaluation";
import type { ExcelEvaluationResult } from "@/shared/types/excel-eval.types";
import { saveAssignmentEvaluation } from "../api/assignment-eval.api";
import { evaluateExcelAssignment } from "../api/excel-eval.api";
import { EvaluationResult } from "../components/evaluation-result";
import { ExcelUploadCard } from "../components/excel-upload-card";
import { LocalEvaluationResultView } from "../components/local-evaluation-result";
import { WorkbookComparisonView } from "../components/workbook-comparison";
import { WorkbookInspector } from "../components/workbook-inspector";

export function ExcelTestPage() {
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [correctFile, setCorrectFile] = useState<File | null>(null);
  const [studentWorkbook, setStudentWorkbook] = useState<ExcelWorkbook | null>(null);
  const [correctWorkbook, setCorrectWorkbook] = useState<ExcelWorkbook | null>(null);
  const [comparison, setComparison] = useState<WorkbookComparison | null>(null);
  const [evaluation, setEvaluation] = useState<ExcelEvaluationResult | null>(null);
  const [localEvaluation, setLocalEvaluation] = useState<LocalEvaluationResult | null>(null);
  const [localSaved, setLocalSaved] = useState(false);
  const [view, setView] = useState<"comparison" | "student" | "correct">("comparison");
  const [extracting, setExtracting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatingLocal, setEvaluatingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = extracting || evaluating || evaluatingLocal;
  const canExtract = Boolean(studentFile && correctFile) && !busy;
  const canEvaluateLocal = Boolean(studentFile && correctFile) && !busy;
  const canEvaluateAi = Boolean(comparison) && !busy;

  const handleStudentFileChange = (file: File | null) => {
    setStudentFile(file);
    setStudentWorkbook(null);
    setCorrectWorkbook(null);
    setComparison(null);
    setEvaluation(null);
    setLocalEvaluation(null);
    setLocalSaved(false);
    setError(null);
  };

  const handleCorrectFileChange = (file: File | null) => {
    setCorrectFile(file);
    setStudentWorkbook(null);
    setCorrectWorkbook(null);
    setComparison(null);
    setEvaluation(null);
    setLocalEvaluation(null);
    setLocalSaved(false);
    setError(null);
  };

  const handleExtract = async () => {
    if (!studentFile || !correctFile) {
      setError("Upload both student and correct-answer files before extracting.");
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const [student, correct] = await Promise.all([
        readAssignmentFile(studentFile),
        readAssignmentFile(correctFile),
      ]);

      const nextComparison = compareWorkbooks(student, correct);
      setStudentWorkbook(student);
      setCorrectWorkbook(correct);
      setComparison(nextComparison);
      setEvaluation(null);
      setLocalEvaluation(null);
      setLocalSaved(false);
      setView("comparison");
    } catch (extractError) {
      setStudentWorkbook(null);
      setCorrectWorkbook(null);
      setComparison(null);
      setLocalEvaluation(null);
      setLocalSaved(false);
      setError(
        extractError instanceof Error
          ? extractError.message
          : "Could not read one or both files.",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleEvaluate = async () => {
    if (!comparison) {
      setError("Extract both files before evaluating.");
      return;
    }

    setEvaluating(true);
    setError(null);

    try {
      const result = await evaluateExcelAssignment(toEvaluationPayload(comparison));
      setEvaluation(result);
    } catch (evaluateError) {
      setEvaluation(null);
      setError(
        evaluateError instanceof Error
          ? evaluateError.message
          : "Could not evaluate the assignment.",
      );
    } finally {
      setEvaluating(false);
    }
  };

  const handleEvaluateWithoutAi = async () => {
    if (!studentFile || !correctFile) {
      setError("Upload both student and correct-answer files before evaluating.");
      return;
    }

    setEvaluatingLocal(true);
    setError(null);
    setLocalSaved(false);

    try {
      let nextComparison = comparison;
      if (!nextComparison || !studentWorkbook || !correctWorkbook) {
        const [student, correct] = await Promise.all([
          readAssignmentFile(studentFile),
          readAssignmentFile(correctFile),
        ]);
        nextComparison = compareWorkbooks(student, correct);
        setStudentWorkbook(student);
        setCorrectWorkbook(correct);
        setComparison(nextComparison);
        setView("comparison");
      }

      const result = evaluateWithoutAi(nextComparison);
      setLocalEvaluation(result);
      await saveAssignmentEvaluation(result);
      setLocalSaved(true);
    } catch (evaluateError) {
      setLocalSaved(false);
      setError(
        evaluateError instanceof Error
          ? evaluateError.message
          : "Could not evaluate or save the assignment.",
      );
    } finally {
      setEvaluatingLocal(false);
    }
  };

  return (
    <div className="h-dvh overflow-y-auto bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            ← Home
          </Link>
          <p className="mt-4 text-sm tracking-[0.2em] text-slate-500 uppercase">
            Extraction preview
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Excel Assignment Test
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Upload student and correct answers as Excel, PDF, or ZIP, compare
            cells locally without AI, then optionally send structured JSON to a
            free Groq model.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <ExcelUploadCard
            title="Student Answer"
            description="Student answer as Excel, PDF, or a ZIP of those files."
            inputId="student-answer-upload"
            file={studentFile}
            onFileChange={handleStudentFileChange}
          />
          <ExcelUploadCard
            title="Correct Answer"
            description="Correct answer as Excel, PDF, or a ZIP of those files."
            inputId="correct-answer-upload"
            file={correctFile}
            onFileChange={handleCorrectFileChange}
          />
        </div>

        <div className="mt-6 flex flex-col items-start gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExtract}
              disabled={!canExtract}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {extracting ? "Extracting..." : "Extract & Compare"}
            </button>
            <button
              type="button"
              onClick={handleEvaluateWithoutAi}
              disabled={!canEvaluateLocal}
              className="rounded-xl border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
            >
              {evaluatingLocal ? "Saving..." : "Evaluate without AI"}
            </button>
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={!canEvaluateAi}
              className="rounded-xl border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
            >
              {evaluating ? "Evaluating..." : "Evaluate with AI"}
            </button>
          </div>
          {!studentFile || !correctFile ? (
            <p className="text-sm text-slate-500">
              Select both files (Excel, PDF, or ZIP) to extract or evaluate without AI.
            </p>
          ) : !comparison ? (
            <p className="text-sm text-slate-500">
              Evaluate without AI compares cells and saves the result to Supabase.
            </p>
          ) : null}
          {error ? (
            <p role="status" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        {localEvaluation ? (
          <div className="mt-10">
            <LocalEvaluationResultView result={localEvaluation} saved={localSaved} />
          </div>
        ) : null}

        {evaluation ? (
          <div className="mt-10">
            <EvaluationResult result={evaluation} />
          </div>
        ) : null}

        {studentWorkbook && correctWorkbook && comparison ? (
          <div className="mt-10 space-y-6">
            <div className="flex flex-wrap gap-2">
              <ViewButton
                active={view === "comparison"}
                onClick={() => setView("comparison")}
              >
                Comparison
              </ViewButton>
              <ViewButton
                active={view === "student"}
                onClick={() => setView("student")}
              >
                Student extract
              </ViewButton>
              <ViewButton
                active={view === "correct"}
                onClick={() => setView("correct")}
              >
                Correct extract
              </ViewButton>
            </div>

            {view === "comparison" ? (
              <WorkbookComparisonView comparison={comparison} />
            ) : null}
            {view === "student" ? (
              <WorkbookInspector title="Student Answer" workbook={studentWorkbook} />
            ) : null}
            {view === "correct" ? (
              <WorkbookInspector title="Correct Answer" workbook={correctWorkbook} />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
      }
    >
      {children}
    </button>
  );
}
