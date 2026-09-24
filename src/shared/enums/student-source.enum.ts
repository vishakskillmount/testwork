export const StudentSource = {
  MongoDB: "mongodb",
  Supabase: "supabase",
} as const;

export type StudentSource = (typeof StudentSource)[keyof typeof StudentSource];
