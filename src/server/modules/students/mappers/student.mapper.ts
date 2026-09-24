import { toIsoString } from "@/shared/utils/date.util";
import type { StudentResponseDto } from "../dto/student-response.dto";
import type { SupabaseStudentRecord } from "../models/student.supabase.model";

export function mapSupabaseStudent(
  row: SupabaseStudentRecord
): StudentResponseDto {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    course: String(row.course ?? ""),
    createdAt: toIsoString(row.created_at),
  };
}
