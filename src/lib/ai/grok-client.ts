import { env } from "@/server/config/env";
import { ApiError } from "@/server/http/api-error";
import type { ExcelEvaluationResult } from "@/shared/types/excel-eval.types";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";

const EVALUATION_JSON_SCHEMA = {
  name: "excel_evaluation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      totalAnswers: { type: "number" },
      wrongAnswers: { type: "number" },
      correctAnswers: { type: "number" },
      explanation: { type: "string" },
    },
    required: ["totalAnswers", "wrongAnswers", "correctAnswers", "explanation"],
    additionalProperties: false,
  },
};

type GroqResponseMode = "schema" | "object" | "text";

type ProviderErrorBody = {
  error?:
    | string
    | {
        message?: string;
        type?: string;
        code?: string;
        failed_generation?: string;
      };
  message?: string;
  code?: string;
  output?: Array<{
    type?: string;
    content?: string | Array<{ type?: string; text?: string }>;
  }>;
  output_text?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
};

export async function evaluateWithGrok(
  systemPrompt: string,
  userPrompt: string,
): Promise<ExcelEvaluationResult> {
  if (env.groqApiKey) {
    return evaluateWithGroq(systemPrompt, userPrompt);
  }

  if (env.xaiApiKey) {
    return evaluateWithXai(systemPrompt, userPrompt);
  }

  throw ApiError.badRequest(
    "Add a free GROQ_API_KEY from https://console.groq.com/keys. xAI Grok is paid and needs credits.",
  );
}

async function evaluateWithGroq(
  systemPrompt: string,
  userPrompt: string,
): Promise<ExcelEvaluationResult> {
  const modes: GroqResponseMode[] = usesStructuredSchema(env.groqModel)
    ? ["schema", "text"]
    : ["object", "text"];

  let lastError = "Evaluation request failed.";
  let lastStatus = 500;

  for (const mode of modes) {
    const data = await requestGroq(systemPrompt, userPrompt, mode);
    if (data.ok) {
      return {
        ...parseEvaluationResult(readChatContent(data.body), env.groqModel),
        model: env.groqModel,
      };
    }

    lastStatus = data.status;
    lastError = readApiError(data.body);

    const failedGeneration = readFailedGeneration(data.body);
    if (failedGeneration) {
      try {
        return {
          ...parseEvaluationResult(failedGeneration, env.groqModel),
          model: env.groqModel,
        };
      } catch {
        // Retry the next response mode with the same prompts.
      }
    }

    if (!isRetryableGroqError(data.status, data.body)) {
      break;
    }
  }

  throw ApiError.internal(`Groq ${lastStatus}: ${lastError}`);
}

async function requestGroq(
  systemPrompt: string,
  userPrompt: string,
  mode: GroqResponseMode,
): Promise<{ ok: boolean; status: number; body: ProviderErrorBody }> {
  const response = await fetch(GROQ_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildGroqRequest(systemPrompt, userPrompt, mode)),
  });

  const body = (await response.json().catch(() => ({}))) as ProviderErrorBody;
  return { ok: response.ok, status: response.status, body };
}

function isRetryableGroqError(status: number, body: ProviderErrorBody): boolean {
  if (status !== 400) {
    return false;
  }

  const message = readApiError(body).toLowerCase();
  return (
    message.includes("json") ||
    message.includes("schema") ||
    message.includes("failed_generation") ||
    Boolean(readFailedGeneration(body))
  );
}

function buildGroqRequest(
  systemPrompt: string,
  userPrompt: string,
  mode: GroqResponseMode,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: env.groqModel,
    temperature: 0,
    max_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  if (usesStructuredSchema(env.groqModel)) {
    body.reasoning_effort = "low";
    body.include_reasoning = false;
  }

  if (mode === "schema") {
    body.response_format = {
      type: "json_schema",
      json_schema: EVALUATION_JSON_SCHEMA,
    };
  }

  if (mode === "object") {
    body.response_format = { type: "json_object" };
  }

  return body;
}

function usesStructuredSchema(model: string): boolean {
  return model.startsWith("openai/gpt-oss") || model.startsWith("qwen/");
}

async function evaluateWithXai(
  systemPrompt: string,
  userPrompt: string,
): Promise<ExcelEvaluationResult> {
  const response = await fetch(XAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.xaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.grokModel,
      temperature: 0,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = (await response.json().catch(() => ({}))) as ProviderErrorBody;
  if (!response.ok) {
    throw ApiError.internal(
      `xAI ${response.status}: ${readApiError(data)} xAI Grok is paid. For a free model, add GROQ_API_KEY from https://console.groq.com/keys.`,
    );
  }

  return {
    ...parseEvaluationResult(readXaiContent(data), env.grokModel),
    model: env.grokModel,
  };
}

export function parseEvaluationResult(
  content: string,
  model = "openai/gpt-oss-20b",
): ExcelEvaluationResult {
  let parsed: Partial<ExcelEvaluationResult>;
  try {
    parsed = JSON.parse(extractJson(content)) as Partial<ExcelEvaluationResult>;
  } catch {
    throw ApiError.internal("The model returned invalid evaluation JSON.");
  }

  const totalAnswers = toCount(parsed.totalAnswers);
  const wrongAnswers = toCount(parsed.wrongAnswers);
  const correctAnswers =
    parsed.correctAnswers === undefined
      ? Math.max(totalAnswers - wrongAnswers, 0)
      : toCount(parsed.correctAnswers);

  if (wrongAnswers > totalAnswers) {
    throw ApiError.internal("The model returned a wrongAnswers count larger than totalAnswers.");
  }

  return {
    totalAnswers,
    wrongAnswers,
    correctAnswers,
    explanation:
      typeof parsed.explanation === "string" && parsed.explanation.trim()
        ? parsed.explanation.trim()
        : "The model counted graded answers by comparing student cells with correct-answer cells.",
    model,
  };
}

function readChatContent(data: ProviderErrorBody): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content;
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("\n")
      .trim();
    if (text) {
      return text;
    }
  }

  throw ApiError.internal("The model returned an empty evaluation.");
}

function readXaiContent(data: ProviderErrorBody): string {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const parts: string[] = [];
  for (const item of data.output ?? []) {
    if (typeof item.content === "string") {
      parts.push(item.content);
      continue;
    }

    if (Array.isArray(item.content)) {
      for (const part of item.content) {
        if (typeof part.text === "string") {
          parts.push(part.text);
        }
      }
    }
  }

  const text = parts.join("\n").trim();
  if (text) {
    return text;
  }

  throw ApiError.internal("The model returned an empty evaluation.");
}

function readFailedGeneration(data: ProviderErrorBody): string | null {
  if (!data.error || typeof data.error === "string") {
    return null;
  }

  const failed = data.error.failed_generation?.trim();
  return failed || null;
}

function readApiError(data: ProviderErrorBody): string {
  if (typeof data.error === "string" && data.error.trim()) {
    return sanitizeError(data.error);
  }

  if (data.error && typeof data.error === "object" && data.error.message) {
    return sanitizeError(data.error.message);
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return sanitizeError(data.message);
  }

  if (typeof data.code === "string" && data.code.trim()) {
    return sanitizeError(data.code);
  }

  return "Evaluation request failed.";
}

function sanitizeError(message: string): string {
  return message
    .replace(/xai-[A-Za-z0-9_-]+/g, "xai-***")
    .replace(/gsk_[A-Za-z0-9_-]+/g, "gsk-***");
}

export function extractJson(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    return candidate;
  }

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1);
  }

  return candidate;
}

function toCount(value: unknown): number {
  const count = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(count) || count < 0 || !Number.isInteger(count)) {
    throw ApiError.internal("The model returned an invalid answer count.");
  }
  return count;
}
