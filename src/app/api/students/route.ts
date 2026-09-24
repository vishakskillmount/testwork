import { studentController } from "@/server/modules/students/controller/student.controller";

export async function GET() {
  return studentController.list();
}

export async function POST(request: Request) {
  return studentController.create(request);
}
