import type { ExcelCellValue, ExcelGrid, ExcelWorkbook } from "@/lib/excel/excel.types";
import { formatCellDisplay } from "@/lib/excel/excel-display";
import { isEmptyCell, toColumnLetter } from "@/lib/excel/grid-detector";

type WorkbookInspectorProps = {
  title: string;
  workbook: ExcelWorkbook;
};

export function WorkbookInspector({ title, workbook }: WorkbookInspectorProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">
        {title}
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">{workbook.name}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {pluralize(workbook.sheetCount, "sheet")} · {pluralize(workbook.gridCount, "detected grid")}
      </p>

      <div className="mt-6 space-y-8">
        {workbook.sheets.length === 0 ? (
          <p className="text-sm text-slate-500">No sheets found in this workbook.</p>
        ) : (
          workbook.sheets.map((sheet) => (
            <article key={sheet.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{sheet.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Used range {sheet.usedRange ?? "n/a"} · {pluralize(sheet.rowCount, "row")} ×{" "}
                    {pluralize(sheet.columnCount, "col")} · {pluralize(sheet.gridCount, "grid")}
                    {sheet.hidden ? " · hidden sheet" : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-5">
                {sheet.grids.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No non-empty grids detected in this sheet.
                  </p>
                ) : (
                  sheet.grids.map((grid) => <GridTable key={grid.id} grid={grid} />)
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function GridTable({ grid }: { grid: ExcelGrid }) {
  const columnLetters = Array.from({ length: grid.columnCount }, (_, index) =>
    toColumnLetter(grid.startCol + index),
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="font-semibold text-slate-900">{grid.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {grid.range} · {pluralize(grid.rowCount, "row")} × {pluralize(grid.columnCount, "col")}
        </p>
      </div>

      <div className="max-h-[32rem] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100">
            <tr>
              <th className="sticky left-0 z-20 border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-500">
                #
              </th>
              {columnLetters.map((letter) => (
                <th
                  key={`${grid.id}-${letter}`}
                  className="border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.cells.map((row, rowIndex) => (
              <tr key={`${grid.id}-r${rowIndex}`}>
                <th className="sticky left-0 z-10 border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-500">
                  {grid.startRow + rowIndex + 1}
                </th>
                {row.map((cell, colIndex) => (
                  <td
                    key={`${grid.id}-r${rowIndex}-c${colIndex}`}
                    className={cellClassName(cell)}
                  >
                    {formatCellDisplay(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cellClassName(value: ExcelCellValue): string {
  const empty = isEmptyCell(value);
  return [
    "border border-slate-200 px-3 py-1.5 align-top whitespace-pre-wrap",
    empty ? "bg-slate-50 text-slate-400" : "bg-white text-slate-900",
  ].join(" ");
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
