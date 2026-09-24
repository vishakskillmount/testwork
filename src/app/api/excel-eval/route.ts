import { excelEvalController } from "@/server/modules/excel-eval/controller/excel-eval.controller";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return excelEvalController.evaluate(request);
}
