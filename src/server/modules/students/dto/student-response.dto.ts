import type {
  CreatedStudents,
  Student,
  StudentsBySource,
} from "@/shared/types/student.types";

/**
 * Wire format returned by the students endpoints. It currently matches the
 * shared model, so these alias it to keep one source of truth.
 */
export type StudentResponseDto = Student;

export type StudentListResponseDto = StudentsBySource;

export type CreateStudentResponseDto = CreatedStudents;
