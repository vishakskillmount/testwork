import { API_ROUTES } from "@/shared/constants/api.constants";
import type {
  CreateStudentInput,
  Student,
  UpdateStudentInput,
} from "@/shared/types/student.types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? "Request failed");
  }

  return data as T;
}

export const studentApi = {
  async list() {
    const data = await request<{ students: Student[] }>(API_ROUTES.STUDENTS);
    return data.students;
  },

  async create(input: CreateStudentInput) {
    const data = await request<{ student: Student }>(API_ROUTES.STUDENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return data.student;
  },

  update(id: string, input: UpdateStudentInput) {
    return request<{ student: Student }>(API_ROUTES.student(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  remove(id: string) {
    return request<void>(API_ROUTES.student(id), { method: "DELETE" });
  },
};
