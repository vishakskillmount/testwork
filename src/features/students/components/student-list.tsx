import type { CreateStudentInput, Student } from "@/shared/types/student.types";
import { StudentCard } from "./student-card";

type StudentListProps = {
  title: string;
  students: Student[];
  pendingId: string | null;
  loading: boolean;
  loadError: string | null;
  onUpdate: (student: Student, input: CreateStudentInput) => Promise<boolean>;
  onDelete: (student: Student) => Promise<boolean>;
};

export function StudentList({
  title,
  students,
  pendingId,
  loading,
  loadError,
  onUpdate,
  onDelete,
}: StudentListProps) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>

      <div className="space-y-3">
        {loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : loading ? (
          <p className="text-gray-500">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500">No students yet</p>
        ) : (
          students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              pending={pendingId === student.id}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
