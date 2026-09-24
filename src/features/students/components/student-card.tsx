"use client";

import { FormEvent, useEffect, useState } from "react";

import type { CreateStudentInput, Student } from "@/shared/types/student.types";
import { studentFieldError } from "@/shared/validation/student-fields";
import { formatDateTime } from "@/shared/utils/date.util";

type StudentCardProps = {
  student: Student;
  pending: boolean;
  onUpdate: (student: Student, input: CreateStudentInput) => Promise<boolean>;
  onDelete: (student: Student) => Promise<boolean>;
};

export function StudentCard({
  student,
  pending,
  onUpdate,
  onDelete,
}: StudentCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [course, setCourse] = useState(student.course);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setName(student.name);
      setEmail(student.email);
      setCourse(student.course);
    }
  }, [student, editing]);

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    const message = studentFieldError({ name, email, course });

    if (message) {
      setError(message);
      return;
    }

    setError(null);
    const saved = await onUpdate(student, {
      name: name.trim(),
      email: email.trim(),
      course: course.trim(),
    });

    if (saved) {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const removed = await onDelete(student);

    if (!removed) {
      setConfirmingDelete(false);
    }
  };

  if (editing) {
    return (
      <form noValidate onSubmit={handleUpdate} className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded border p-2"
            disabled={pending}
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded border p-2"
            disabled={pending}
          />
          <input
            type="text"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            className="rounded border p-2"
            disabled={pending}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-black px-3 py-2 text-sm text-white"
            >
              {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              className="rounded border px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="font-semibold">{student.name}</p>
      <p>{student.email}</p>
      <p className="text-gray-600">{student.course}</p>
      <p className="mt-2 text-sm text-gray-500" suppressHydrationWarning>
        Added {formatDateTime(student.createdAt)}
      </p>
      <div className="mt-3 flex gap-2">
        {confirmingDelete ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
            >
              {pending ? "Deleting..." : "Confirm delete"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingDelete(false)}
              className="rounded border px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(true)}
              className="rounded border px-3 py-1 text-sm"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmingDelete(true)}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-600"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
