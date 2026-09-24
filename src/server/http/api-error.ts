export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static internal(message: string) {
    return new ApiError(500, message);
  }
}

export function toErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error(fallbackMessage, error);

  return Response.json({ error: fallbackMessage }, { status: 500 });
}
