import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/server/http/api-error";

const supabaseStudentRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

vi.mock("../repositories/student.supabase.repository", () => ({
  supabaseStudentRepository,
}));

const { studentService } = await import("./student.service");

const input = {
  name: "Asha",
  email: "asha@example.com",
  course: "Next.js",
};

const student = {
  id: "supabase-1",
  ...input,
  createdAt: "2026-09-22T00:00:00.000Z",
};

describe("studentService.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns students from Supabase", async () => {
    supabaseStudentRepository.findAll.mockResolvedValue([student]);

    await expect(studentService.list()).resolves.toEqual({
      students: [student],
    });
  });
});

describe("studentService.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the Supabase student when the write succeeds", async () => {
    supabaseStudentRepository.create.mockResolvedValue(student);

    const created = await studentService.create(input);

    expect(created.student.id).toBe("supabase-1");
    expect(supabaseStudentRepository.create).toHaveBeenCalledWith(
      input,
      expect.any(Date)
    );
  });

  it("surfaces a Supabase error", async () => {
    supabaseStudentRepository.create.mockRejectedValue(
      ApiError.internal("Supabase denied this change.")
    );

    await expect(studentService.create(input)).rejects.toThrow(
      "Supabase denied this change."
    );
  });
});

describe("studentService.update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the Supabase student", async () => {
    supabaseStudentRepository.update.mockResolvedValue(student);

    await studentService.update("supabase-1", input);

    expect(supabaseStudentRepository.update).toHaveBeenCalledWith(
      "supabase-1",
      input
    );
  });
});

describe("studentService.remove", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the Supabase student", async () => {
    supabaseStudentRepository.remove.mockResolvedValue(undefined);

    await studentService.remove("supabase-1");

    expect(supabaseStudentRepository.remove).toHaveBeenCalledWith("supabase-1");
  });
});
