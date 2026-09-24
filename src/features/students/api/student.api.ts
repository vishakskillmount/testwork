import { API_ROUTES } from "@/shared/constants/api.constants";
import type { StudentSource } from "@/shared/enums/student-source.enum";
import type {
  CreateStudentInput,
  CreatedStudents,
  Student,
  StudentsBySource,
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
  list() {
    return request<StudentsBySource>(API_ROUTES.STUDENTS);
  },

  create(input: CreateStudentInput) {
    return request<CreatedStudents>(API_ROUTES.STUDENTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: UpdateStudentInput) {
    return request<{ student: Student }>(API_ROUTES.student(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  },

  remove(id: string, source: StudentSource) {
    const url = `${API_ROUTES.student(id)}?source=${encodeURIComponent(source)}`;
    return request<void>(url, { method: "DELETE" });
  },
};
