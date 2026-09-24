import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/server/http/api-error";

const mongoStudentRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const supabaseStudentRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

vi.mock("../repositories/student.mongo.repository", () => ({
  mongoStudentRepository,
}));

vi.mock("../repositories/student.supabase.repository", () => ({
  supabaseStudentRepository,
}));

const { studentService } = await import("./student.service");

const input = {
  name: "Asha",
  email: "asha@example.com",
  course: "Next.js",
};

describe("studentService.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns both records when both writes succeed", async () => {
    mongoStudentRepository.create.mockResolvedValue({
      id: "mongo-1",
      ...input,
      createdAt: "2026-09-22T00:00:00.000Z",
      source: "mongodb",
    });
    supabaseStudentRepository.create.mockResolvedValue({
      id: "supabase-1",
      ...input,
      createdAt: "2026-09-22T00:00:00.000Z",
      source: "supabase",
    });

    const created = await studentService.create(input);

    expect(created.mongodb.id).toBe("mongo-1");
    expect(created.supabase.id).toBe("supabase-1");
    expect(mongoStudentRepository.remove).not.toHaveBeenCalled();
  });

  it("removes the MongoDB row when Supabase fails", async () => {
    mongoStudentRepository.create.mockResolvedValue({
      id: "mongo-1",
      ...input,
      createdAt: "2026-09-22T00:00:00.000Z",
      source: "mongodb",
    });
    supabaseStudentRepository.create.mockRejectedValue(
      ApiError.internal("Supabase denied this change.")
    );
    mongoStudentRepository.remove.mockResolvedValue(undefined);

    await expect(studentService.create(input)).rejects.toThrow(
      "Supabase denied this change."
    );
    expect(mongoStudentRepository.remove).toHaveBeenCalledWith("mongo-1");
  });

  it("reports a split write when the MongoDB rollback also fails", async () => {
    mongoStudentRepository.create.mockResolvedValue({
      id: "mongo-1",
      ...input,
      createdAt: "2026-09-22T00:00:00.000Z",
      source: "mongodb",
    });
    supabaseStudentRepository.create.mockRejectedValue(new Error("down"));
    mongoStudentRepository.remove.mockRejectedValue(new Error("rollback down"));

    await expect(studentService.create(input)).rejects.toThrow(
      "could not be removed"
    );
  });
});

describe("studentService.update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates only the selected store", async () => {
    supabaseStudentRepository.update.mockResolvedValue({
      id: "supabase-1",
      ...input,
      createdAt: "2026-09-22T00:00:00.000Z",
      source: "supabase",
    });

    await studentService.update("supabase-1", "supabase", input);

    expect(supabaseStudentRepository.update).toHaveBeenCalledWith(
      "supabase-1",
      input
    );
    expect(mongoStudentRepository.update).not.toHaveBeenCalled();
  });
});
