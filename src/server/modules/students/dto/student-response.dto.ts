import type { Student } from "@/shared/types/student.types";

/**
 * Wire format returned by the students endpoints. It currently matches the
 * shared model, so these alias it to keep one source of truth.
 */
export type StudentResponseDto = Student;

export type StudentListResponseDto = {
  students: Student[];
};

export type CreateStudentResponseDto = {
  student: Student;
};
