import { ApiError } from "@/server/http/api-error";
import { StudentSource } from "@/shared/enums/student-source.enum";
import type { StudentSource as StudentSourceValue } from "@/shared/enums/student-source.enum";
import { studentFieldError } from "@/shared/validation/student-fields";
import type { CreateStudentDto } from "../dto/create-student.dto";
import type { UpdateStudentDto } from "../dto/update-student.dto";

function trimmed(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseCreateStudentDto(payload: unknown): CreateStudentDto {
  const body = (payload ?? {}) as Record<string, unknown>;
  const fields = {
    name: trimmed(body.name),
    email: trimmed(body.email),
    course: trimmed(body.course),
  };
  const message = studentFieldError(fields);

  if (message) {
    throw ApiError.badRequest(message);
  }

  return fields;
}

export function parseUpdateStudentDto(payload: unknown): UpdateStudentDto {
  return parseCreateStudentDto(payload);
}

export function parseStudentSource(value: unknown): StudentSourceValue {
  if (value === StudentSource.MongoDB || value === StudentSource.Supabase) {
    return value;
  }

  throw ApiError.badRequest("Invalid student source");
}
