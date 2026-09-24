import { ApiError } from "@/server/http/api-error";
import type { CreateStudentDto } from "../dto/create-student.dto";
import type { UpdateStudentDto } from "../dto/update-student.dto";
import type { StudentResponseDto } from "../dto/student-response.dto";
import { mapSupabaseStudent } from "../mappers/student.mapper";
import {
  supabaseStudentModel,
  type SupabaseStudentRecord,
} from "../models/student.supabase.model";

const PERMISSION_HINT =
  "Supabase denied this change. Run supabase/students.sql in the Supabase SQL editor, then try again.";

function throwIfSupabaseError(error: { message: string } | null) {
  if (!error) {
    return;
  }

  if (error.message.toLowerCase().includes("permission denied")) {
    throw ApiError.internal(PERMISSION_HINT);
  }

  throw ApiError.internal(error.message);
}

export const supabaseStudentRepository = {
  async findAll(): Promise<StudentResponseDto[]> {
    const { data, error } = await supabaseStudentModel()
      .select("*")
      .order("created_at", { ascending: false });

    throwIfSupabaseError(error);

    return ((data ?? []) as SupabaseStudentRecord[]).map(mapSupabaseStudent);
  },

  async create(
    input: CreateStudentDto,
    createdAt: Date
  ): Promise<StudentResponseDto> {
    const row = { ...input, created_at: createdAt.toISOString() };

    const { data, error } = await supabaseStudentModel()
      .insert(row)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    // Read-back can be empty when the select policy is restricted, so fall
    // back to the row we just wrote.
    return mapSupabaseStudent((data as SupabaseStudentRecord | null) ?? row);
  },

  async update(id: string, input: UpdateStudentDto): Promise<StudentResponseDto> {
    const { data, error } = await supabaseStudentModel()
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    throwIfSupabaseError(error);

    if (!data) {
      throw ApiError.notFound("Student not found");
    }

    return mapSupabaseStudent(data as SupabaseStudentRecord);
  },

  async remove(id: string): Promise<void> {
    const { data, error } = await supabaseStudentModel()
      .delete()
      .eq("id", id)
      .select("id");

    throwIfSupabaseError(error);

    if (!data?.length) {
      throw ApiError.notFound("Student not found");
    }
  },
};
