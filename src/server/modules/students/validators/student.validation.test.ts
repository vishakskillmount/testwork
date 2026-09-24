import { describe, expect, it } from "vitest";

import { ApiError } from "@/server/http/api-error";
import { parseCreateStudentDto } from "./student.validation";

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
