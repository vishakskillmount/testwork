import type {
  ComparedCell,
  ComparedGrid,
  ComparedSheet,
  WorkbookComparison,
} from "@/lib/excel/excel.types";
import { formatCellDisplay } from "@/lib/excel/excel-display";
import { toColumnLetter } from "@/lib/excel/grid-detector";

type WorkbookComparisonProps = {
  comparison: WorkbookComparison;
};

export function WorkbookComparisonView({ comparison }: WorkbookComparisonProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">
        Comparison
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">
        {comparison.studentName}
        <span className="mx-3 text-lg font-medium text-slate-400">vs</span>
        {comparison.correctName}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {comparison.matchCount} same · {comparison.differentCount} different ·{" "}
        {comparison.studentOnlyCount} only in student · {comparison.correctOnlyCount} only
        in correct
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <Legend swatch="bg-emerald-100 border-emerald-200" label="Same" />
        <Legend swatch="bg-rose-100 border-rose-200" label="Different" />
        <Legend swatch="bg-amber-100 border-amber-200" label="Only in student" />
        <Legend swatch="bg-sky-100 border-sky-200" label="Only in correct" />
      </div>

      <div className="mt-6 space-y-8">
        {comparison.sheets.length === 0 ? (
          <p className="text-sm text-slate-500">No sheets to compare.</p>
        ) : (
          comparison.sheets.map((sheet) => (
            <ComparedSheetBlock key={sheet.name} sheet={sheet} />
          ))
        )}
      </div>
    </section>
  );
}

function ComparedSheetBlock({ sheet }: { sheet: ComparedSheet }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-xl font-semibold text-slate-900">{sheet.name}</h3>
      <p className="mt-1 text-sm text-slate-600">
        Student: {sheet.studentSheet ? sheet.studentSheet.name : "missing"} · Correct:{" "}
        {sheet.correctSheet ? sheet.correctSheet.name : "missing"} · {sheet.differentCount}{" "}
        different
      </p>

      <div className="mt-4 space-y-5">
        {sheet.grids.length === 0 ? (
          <p className="text-sm text-slate-500">No grids to compare in this sheet.</p>
        ) : (
          sheet.grids.map((grid, index) => (
            <ComparedGridBlock key={`${sheet.name}-grid-${index}`} grid={grid} />
          ))
        )}
      </div>
    </article>
  );
}

function ComparedGridBlock({ grid }: { grid: ComparedGrid }) {
  const differences = grid.cells.flat().filter((cell) => cell.status !== "match" && cell.status !== "empty");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="font-semibold text-slate-900">{grid.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          Student {grid.studentGrid?.range ?? "missing"} · Correct {grid.correctGrid?.range ?? "missing"} ·{" "}
          {grid.differentCount} different
        </p>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <CompareTable
          title="Student Answer"
          side="student"
          grid={grid}
        />
        <CompareTable
          title="Correct Answer"
          side="correct"
          grid={grid}
        />
      </div>

      {differences.length > 0 ? (
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Changed cells
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {differences.map((cell) => (
              <li key={`${cell.row}-${cell.col}`}>
                <span className="font-medium text-slate-900">
                  {cell.studentAddress ?? cell.correctAddress ?? `${cell.row + 1}:${cell.col + 1}`}
                </span>
                {": "}
                {formatCellDisplay(cell.studentValue) || "empty"}
                {" → "}
                {formatCellDisplay(cell.correctValue) || "empty"}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
          No cell differences in this grid.
        </p>
      )}
    </div>
  );
}

function CompareTable({
  title,
  side,
  grid,
}: {
  title: string;
  side: "student" | "correct";
  grid: ComparedGrid;
}) {
  const source = side === "student" ? grid.studentGrid : grid.correctGrid;
  const columnLetters = Array.from({ length: grid.columnCount }, (_, index) =>
    source ? toColumnLetter(source.startCol + index) : String(index + 1),
  );

  return (
    <div className={side === "student" ? "border-b border-slate-200 lg:border-r lg:border-b-0" : ""}>
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
        {title}
        {source ? ` · ${source.range}` : " · missing"}
      </div>
      <div className="max-h-[28rem] overflow-auto">
        {grid.rowCount === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No cells on this side.</p>
        ) : (
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100">
              <tr>
                <th className="sticky left-0 z-20 border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-500">
                  #
                </th>
                {columnLetters.map((letter) => (
                  <th
                    key={`${side}-${grid.name}-${letter}`}
                    className="border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500"
                  >
                    {letter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.cells.map((row, rowIndex) => (
                <tr key={`${side}-${grid.name}-r${rowIndex}`}>
                  <th className="sticky left-0 z-10 border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500">
                    {source ? source.startRow + rowIndex + 1 : rowIndex + 1}
                  </th>
                  {row.map((cell) => (
                    <td
                      key={`${side}-${grid.name}-r${rowIndex}-c${cell.col}`}
                      className={compareCellClassName(cell.status)}
                    >
                      {formatComparedValue(cell, side)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatComparedValue(cell: ComparedCell, side: "student" | "correct"): string {
  return formatCellDisplay(side === "student" ? cell.studentValue : cell.correctValue);
}

function compareCellClassName(status: ComparedCell["status"]): string {
  const colors = {
    match: "bg-emerald-50 text-slate-900",
    different: "bg-rose-100 text-rose-950",
    "student-only": "bg-amber-100 text-amber-950",
    "correct-only": "bg-sky-100 text-sky-950",
    empty: "bg-slate-50 text-slate-400",
  };

  return `border border-slate-200 px-3 py-1.5 align-top whitespace-pre-wrap ${colors[status]}`;
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-600">
      <span className={`h-3 w-3 rounded border ${swatch}`} />
      {label}
    </span>
  );
}
