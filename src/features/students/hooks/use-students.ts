"use client";

import { useCallback, useEffect, useState } from "react";

import type { CreateStudentInput, Student } from "@/shared/types/student.types";
import { studentApi } from "../api/student.api";

export type StudentNotice = {
  tone: "success" | "error";
  message: string;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<StudentNotice | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStudents(await studentApi.list());
      setLoadError(null);
    } catch (error) {
      setLoadError(errorMessage(error, "Failed to load students"));
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudent = useCallback(
    async (input: CreateStudentInput) => {
      setSaving(true);

      try {
        await studentApi.create(input);
        setNotice({
          tone: "success",
          message: "Student added.",
        });
        await refresh();
        return true;
      } catch (error) {
        setNotice({
          tone: "error",
          message: errorMessage(error, "Failed to add student"),
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const updateStudent = useCallback(
    async (student: Student, input: CreateStudentInput) => {
      setPendingId(student.id);

      try {
        await studentApi.update(student.id, input);
        setNotice({
          tone: "success",
          message: `Updated ${student.name}.`,
        });
        await refresh();
        return true;
      } catch (error) {
        setNotice({
          tone: "error",
          message: errorMessage(error, "Failed to update student"),
        });
        return false;
      } finally {
        setPendingId(null);
      }
    },
    [refresh]
  );

  const deleteStudent = useCallback(
    async (student: Student) => {
      setPendingId(student.id);

      try {
        await studentApi.remove(student.id);
        setNotice({
          tone: "success",
          message: `Deleted ${student.name}.`,
        });
        await refresh();
        return true;
      } catch (error) {
        setNotice({
          tone: "error",
          message: errorMessage(error, "Failed to delete student"),
        });
        return false;
      } finally {
        setPendingId(null);
      }
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    students,
    saving,
    pendingId,
    loading,
    loadError,
    notice,
    addStudent,
    updateStudent,
    deleteStudent,
    refresh,
  };
}
