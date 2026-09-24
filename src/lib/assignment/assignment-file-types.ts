const EXCEL_EXTENSIONS = [".xlsx", ".xls", ".xlsm", ".xlsb"];

type NamedFile = {
  name: string;
  type?: string;
};

export function isPdfFile(file: NamedFile): boolean {
  const type = file.type ?? "";
  return type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function isExcelFile(file: NamedFile): boolean {
  const name = file.name.toLowerCase();
  const type = file.type ?? "";
  return (
    type.includes("spreadsheet") ||
    type === "application/vnd.ms-excel" ||
    EXCEL_EXTENSIONS.some((extension) => name.endsWith(extension))
  );
}

export function isZipFile(file: NamedFile): boolean {
  const type = file.type ?? "";
  const name = file.name.toLowerCase();
  return (
    type === "application/zip" ||
    type === "application/x-zip-compressed" ||
    type === "application/x-zip" ||
    name.endsWith(".zip")
  );
}
