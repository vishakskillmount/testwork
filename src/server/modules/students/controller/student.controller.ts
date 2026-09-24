import { ApiError, toErrorResponse } from "@/server/http/api-error";
import { studentService } from "../service/student.service";
import {
  parseCreateStudentDto,
  parseStudentSource,
  parseUpdateStudentDto,
} from "../validators/student.validation";

async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw ApiError.badRequest("Invalid JSON");
  }
}

export const studentController = {
  async list() {
    try {
      return Response.json(await studentService.list());
    } catch (error) {
      return toErrorResponse(error, "Failed to fetch students");
    }
  },

  async create(request: Request) {
    try {
      const dto = parseCreateStudentDto(await readJsonBody(request));
      const created = await studentService.create(dto);

      return Response.json(created, { status: 201 });
    } catch (error) {
      return toErrorResponse(error, "Failed to add student");
    }
  },

  async update(id: string, request: Request) {
    try {
      const body = await readJsonBody(request);
      const source = parseStudentSource(
        (body as { source?: unknown }).source
      );
      const dto = parseUpdateStudentDto(body);
      const student = await studentService.update(id, source, dto);

      return Response.json({ student });
    } catch (error) {
      return toErrorResponse(error, "Failed to update student");
    }
  },

  async remove(id: string, request: Request) {
    try {
      const source = parseStudentSource(
        new URL(request.url).searchParams.get("source")
      );

      await studentService.remove(id, source);

      return new Response(null, { status: 204 });
    } catch (error) {
      return toErrorResponse(error, "Failed to delete student");
    }
  },
};
