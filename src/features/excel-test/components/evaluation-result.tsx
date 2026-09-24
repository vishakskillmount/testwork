import type { ExcelEvaluationResult } from "@/shared/types/excel-eval.types";

type EvaluationResultProps = {
  result: ExcelEvaluationResult;
};

export function EvaluationResult({ result }: EvaluationResultProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">
        AI evaluation
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">Answer counts</h2>
      <p className="mt-2 text-sm text-slate-600">
        Model {result.model} · compared student answers with correct answers
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <CountCard label="Total answers" value={result.totalAnswers} />
        <CountCard label="Wrong answers" value={result.wrongAnswers} tone="wrong" />
        <CountCard label="Correct answers" value={result.correctAnswers} tone="correct" />
      </div>

      <p className="mt-6 text-sm leading-6 text-slate-700">{result.explanation}</p>
    </section>
  );
}

function CountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "wrong" | "correct";
}) {
  const color =
    tone === "wrong"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : tone === "correct"
        ? "border-emerald-200 bg-emerald-50 text-emerald-950"
        : "border-slate-200 bg-slate-50 text-slate-900";

  return (
    <div className={`rounded-xl border px-4 py-5 ${color}`}>
      <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  );
}
