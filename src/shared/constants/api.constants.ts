export const API_ROUTES = {
  STUDENTS: "/api/students",
  student: (id: string) => `/api/students/${encodeURIComponent(id)}`,
  EXCEL_EVAL: "/api/excel-eval",
  ASSIGNMENT_EVALS: "/api/assignment-evals",
} as const;
