import { FastifyReply, FastifyRequest } from "fastify";

class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send({ error: { code: error.code, message: error.message } });
  } else {
    request.log.error(error);
    reply
      .status(500)
      .send({ error: { code: "INTERNAL", message: "Internal Server Error" } });
  }
}
export { AppError, errorHandler };
