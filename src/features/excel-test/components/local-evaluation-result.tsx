"use client";

import { useEffect, useMemo, useState } from "react";

import type { LocalEvaluationResult, LocalMismatch } from "@/lib/excel/local-evaluation";

type DetailView = "wrong" | "correct";

type LocalEvaluationResultViewProps = {
  result: LocalEvaluationResult;
  saved?: boolean;
};

const PAGE_SIZE = 10;

export function LocalEvaluationResultView({ result, saved }: LocalEvaluationResultViewProps) {
  const [view, setView] = useState<DetailView>("wrong");
  const [page, setPage] = useState(1);

  const rows = view === "wrong" ? result.mismatches : result.matches;
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [currentPage, rows]);

  useEffect(() => {
    setPage(1);
  }, [result.studentName, result.correctName, result.totalAnswers, view]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">
        Evaluate without AI
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">Comparison result</h2>
      <p className="mt-2 text-sm text-slate-600">
        Spaces and punctuation are ignored. Only letters and numbers are compared,
        without case. Compared {result.studentName} with {result.correctName}.
      </p>

      <p
        role="status"
        className={
          result.wrongAnswers > 0
            ? "mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-950"
            : "mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950"
        }
      >
        {result.message}
      </p>

      {saved ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">Saved to Supabase.</p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <CountCard label="Total answers" value={result.totalAnswers} />
        <CountCard
          label="Wrong answers"
          value={result.wrongAnswers}
          tone="wrong"
          active={view === "wrong"}
          onClick={() => setView("wrong")}
        />
        <CountCard
          label="Correct answers"
          value={result.correctAnswers}
          tone="correct"
          active={view === "correct"}
          onClick={() => setView("correct")}
        />
      </div>

      <AnswerDetails
        title={view === "wrong" ? "Wrong answers" : "Correct answers"}
        emptyLabel={view === "wrong" ? "No wrong answers." : "No correct answers."}
        rows={pagedRows}
        page={currentPage}
        pageCount={pageCount}
        total={rows.length}
        onPageChange={setPage}
      />
    </section>
  );
}

function AnswerDetails({
  title,
  emptyLabel,
  rows,
  page,
  pageCount,
  total,
  onPageChange,
}: {
  title: string;
  emptyLabel: string;
  rows: LocalMismatch[];
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {total > 0 ? (
          <p className="text-xs text-slate-500">
            Showing {start}-{end} of {total}
          </p>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <th className="py-2 pr-4 font-semibold">Sheet</th>
                <th className="py-2 pr-4 font-semibold">Cell</th>
                <th className="py-2 pr-4 font-semibold">Student</th>
                <th className="py-2 pr-4 font-semibold">Correct</th>
                <th className="py-2 font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, index) => (
                <tr key={`${item.sheet}-${item.address}-${index}`} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-4 text-slate-700">{item.sheet}</td>
                  <td className="py-2 pr-4 font-medium text-slate-900">{item.address}</td>
                  <td className="max-w-xs py-2 pr-4 whitespace-pre-wrap text-rose-800">
                    {item.studentValue || "—"}
                  </td>
                  <td className="max-w-xs py-2 pr-4 whitespace-pre-wrap text-emerald-800">
                    {item.correctValue || "—"}
                  </td>
                  <td className="max-w-xs py-2 font-medium text-slate-800">
                    {item.difference ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Previous
          </button>
          <p className="text-sm text-slate-600">
            Page {page} of {pageCount}
          </p>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "wrong" | "correct";
  active?: boolean;
  onClick?: () => void;
}) {
  const color =
    tone === "wrong"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : tone === "correct"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-900";
  const ring = active ? "ring-2 ring-slate-900" : "";

  if (!onClick) {
    return (
      <div className={`rounded-xl border px-4 py-5 ${color}`}>
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
        <p className="mt-2 text-4xl font-bold">{value}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-5 text-left ${color} ${ring}`}
    >
      <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
      <p className="mt-2 text-xs font-medium">Click to view</p>
    </button>
  );
}
