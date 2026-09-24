import { describe, expect, it } from "vitest";

import { ApiError } from "@/server/http/api-error";
import {
  parseCreateStudentDto,
  parseStudentSource,
} from "./student.validation";

describe("parseCreateStudentDto", () => {
  it("trims a valid student", () => {
    expect(
      parseCreateStudentDto({
        name: "  Asha  ",
        email: " asha@example.com ",
        course: " Next.js ",
      })
    ).toEqual({
      name: "Asha",
      email: "asha@example.com",
      course: "Next.js",
    });
  });

  it("rejects a missing field", () => {
    expect(() => parseCreateStudentDto({ name: "Asha" })).toThrow(ApiError);
    expect(() => parseCreateStudentDto({ name: "Asha" })).toThrow(
      "Please fill all fields"
    );
  });

  it("rejects an invalid email", () => {
    expect(() =>
      parseCreateStudentDto({
        name: "Asha",
        email: "not-an-email",
        course: "Next.js",
      })
    ).toThrow("Enter a valid email address");
  });
});

describe("parseStudentSource", () => {
  it("accepts the two stores", () => {
    expect(parseStudentSource("mongodb")).toBe("mongodb");
    expect(parseStudentSource("supabase")).toBe("supabase");
  });

  it("rejects an unknown store", () => {
    expect(() => parseStudentSource("postgres")).toThrow(
      "Invalid student source"
    );
  });
});
