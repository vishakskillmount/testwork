"use client";

import { FormEvent, useState } from "react";

import { studentFieldError } from "@/shared/validation/student-fields";
import type { CreateStudentInput } from "@/shared/types/student.types";

type StudentFormProps = {
  saving: boolean;
  onSubmit: (input: CreateStudentInput) => Promise<boolean>;
};

export function StudentForm({ saving, onSubmit }: StudentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = studentFieldError({ name, email, course });

    if (message) {
      setError(message);
      return;
    }

    setError(null);
    const saved = await onSubmit({ name: name.trim(), email: email.trim(), course: course.trim() });

    if (saved) {
      setName("");
      setEmail("");
      setCourse("");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-none">
      <h2 className="mb-4 text-xl font-semibold">Add Student</h2>

      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border p-3"
        />

        <input
          type="text"
          placeholder="Course"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          className="rounded border p-3"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded bg-black p-3 text-white"
        >
          {saving ? "Adding..." : "Add Student"}
        </button>
      </div>
    </form>
  );
}
