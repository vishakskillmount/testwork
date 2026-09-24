import type { StudentSource } from "@/shared/enums/student-source.enum";

export type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  createdAt: string;
  source: StudentSource;
};

export type CreateStudentInput = {
  name: string;
  email: string;
  course: string;
};

export type UpdateStudentInput = CreateStudentInput & {
  source: StudentSource;
};

export type StudentsBySource = {
  mongodb: Student[];
  supabase: Student[];
};

export type CreatedStudents = {
  mongodb: Student;
  supabase: Student;
};
