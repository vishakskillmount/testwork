"use client";

import Link from "next/link";

import { Notice } from "../components/notice";
import { StudentForm } from "../components/student-form";
import { StudentList } from "../components/student-list";
import { useStudents } from "../hooks/use-students";

export function StudentsPage() {
  const {
    students,
    saving,
    pendingId,
    loading,
    loadError,
    notice,
    addStudent,
    updateStudent,
    deleteStudent,
  } = useStudents();

  return (
    <div className="h-dvh overflow-y-auto bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Student Management</h1>
            <p className="mt-2 text-slate-600">Add, update, and delete student records.</p>
          </div>
          <Link
            href="/excel-test"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Excel Assignment Test
          </Link>
        </header>

        {notice ? <Notice tone={notice.tone} message={notice.message} /> : null}

        <StudentForm saving={saving} onSubmit={addStudent} />

        <div className="grid gap-10 md:grid-cols-2">
          <StudentList
            title="MongoDB Students"
            students={students.mongodb}
            pendingId={pendingId}
            loading={loading}
            loadError={loadError}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
          />
          <StudentList
            title="Supabase Students"
            students={students.supabase}
            pendingId={pendingId}
            loading={loading}
            loadError={loadError}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
          />
        </div>
      </div>
    </div>
  );
}
