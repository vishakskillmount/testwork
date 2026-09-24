import { getSupabaseClient } from "@/server/database/supabase.client";
import { STUDENTS_TABLE } from "@/shared/constants/database.constants";

/** Row stored in the Supabase `students` table. */
export type SupabaseStudentRecord = {
  id?: string;
  name: string;
  email: string;
  course: string;
  created_at: string;
};

export function supabaseStudentModel() {
  return getSupabaseClient().from(STUDENTS_TABLE);
}
