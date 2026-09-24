import JSZip from "jszip";

import { isExcelFile, isPdfFile } from "@/lib/assignment/assignment-file-types";
import { readExcelWorkbook } from "@/lib/excel/excel-reader";
import type { ExcelSheet, ExcelWorkbook } from "@/lib/excel/excel.types";
import { readPdfWorkbook } from "@/lib/pdf/pdf-reader";

export async function readZipWorkbook(file: File): Promise<ExcelWorkbook> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files)
    .filter((entry) => !entry.dir && isSupportedZipEntry(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (entries.length === 0) {
    throw new Error("The ZIP did not contain any Excel or PDF files.");
  }

  const workbooks: ExcelWorkbook[] = [];

  for (const entry of entries) {
    const name = fileNameFromPath(entry.name);
    const bytes = await entry.async("uint8array");
    const inner = new File([toArrayBuffer(bytes)], name, { type: mimeForName(name) });
    workbooks.push(
      isPdfFile(inner) ? await readPdfWorkbook(inner) : await readExcelWorkbook(inner),
    );
  }

  return mergeWorkbooks(file.name, workbooks);
}

export function isSupportedZipEntry(path: string): boolean {
  if (shouldSkipZipPath(path)) {
    return false;
  }

  const name = fileNameFromPath(path);
  return isExcelFile({ name }) || isPdfFile({ name });
}

export function mergeWorkbooks(name: string, workbooks: ExcelWorkbook[]): ExcelWorkbook {
  const prefixNames = workbooks.length > 1;
  const usedNames = new Set<string>();
  const sheets: ExcelSheet[] = [];

  for (const workbook of workbooks) {
    const prefix = prefixNames ? stripExtension(workbook.name) : null;

    for (const sheet of workbook.sheets) {
      const baseName = prefix ? `${prefix} / ${sheet.name}` : sheet.name;
      sheets.push({
        ...sheet,
        name: uniqueSheetName(baseName, usedNames),
      });
    }
  }

  return {
    name,
    sheetCount: sheets.length,
    gridCount: sheets.reduce((total, sheet) => total + sheet.gridCount, 0),
    sheets,
  };
}

function shouldSkipZipPath(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  const name = fileNameFromPath(normalized);
  return (
    normalized.includes("__MACOSX/") ||
    name.startsWith("._") ||
    name === ".DS_Store"
  );
}

function fileNameFromPath(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  return normalized.split("/").pop() || normalized;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

function uniqueSheetName(base: string, usedNames: Set<string>): string {
  if (!usedNames.has(base)) {
    usedNames.add(base);
    return base;
  }

  let index = 2;
  let next = `${base} (${index})`;
  while (usedNames.has(next)) {
    index += 1;
    next = `${base} (${index})`;
  }

  usedNames.add(next);
  return next;
}

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function mimeForName(name: string): string {
  if (name.toLowerCase().endsWith(".pdf")) {
    return "application/pdf";
  }

  return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}
