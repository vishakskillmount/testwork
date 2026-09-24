import { studentController } from "@/server/modules/students/controller/student.controller";

type StudentRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: StudentRouteContext) {
  const { id } = await context.params;
  return studentController.update(id, request);
}

export async function DELETE(_request: Request, context: StudentRouteContext) {
  const { id } = await context.params;
  return studentController.remove(id);
}
