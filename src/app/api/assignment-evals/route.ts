import { assignmentEvalController } from "@/server/modules/assignment-evals/controller/assignment-eval.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return assignmentEvalController.save(request);
}
