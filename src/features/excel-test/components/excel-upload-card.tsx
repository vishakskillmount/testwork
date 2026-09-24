import { ChangeEvent } from "react";

type ExcelUploadCardProps = {
  title: string;
  description: string;
  inputId: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
};

const ACCEPT = [
  ".xlsx",
  ".xls",
  ".xlsm",
  ".xlsb",
  ".pdf",
  ".zip",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
].join(",");

export function ExcelUploadCard({
  title,
  description,
  inputId,
  file,
  onFileChange,
}: ExcelUploadCardProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);
  };

  return (
    <label
      htmlFor={inputId}
      className="block cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400"
    >
      <p className="text-sm font-medium tracking-[0.16em] text-slate-500 uppercase">
        Upload Excel, PDF, or ZIP
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <input
          id={inputId}
          type="file"
          accept={ACCEPT}
          onChange={handleChange}
          className="sr-only"
        />
        <p className="text-sm font-medium text-slate-800">
          {file ? file.name : "No file selected"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {file
            ? `${formatBytes(file.size)} · click to replace`
            : "Click to choose .xlsx, .xls, or .pdf, or .zip"}
        </p>
      </div>
    </label>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
