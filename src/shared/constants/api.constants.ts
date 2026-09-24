export const API_ROUTES = {
  STUDENTS: "/api/students",
  student: (id: string) => `/api/students/${encodeURIComponent(id)}`,
  EXCEL_EVAL: "/api/excel-eval",
} as const;
