import {
  AppError,
  correlationPlugin,
  createLogger,
  errorHandler,
  genCorrelationId,
} from "@corelab/common";
import Fastify from "fastify";
import { Type, Static } from "typebox";
import { Deps } from "./store.js";
import { randomUUID } from "node:crypto";

const AuthBodySchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8, maxLength: 200 }),
  },
  { additionalProperties: false },
);

type AuthBody = Static<typeof AuthBodySchema>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildApp(deps: Deps) {
  const app = Fastify({
    loggerInstance: createLogger("accounts"),
    genReqId: genCorrelationId,
    requestIdLogLabel: "correlationId",
  });
  app.setErrorHandler(errorHandler);
  app.register(correlationPlugin);
  app.get("/health", async () => ({
    status: "ok",
  }));

  app.register(
    async (v1) => {
      v1.post<{ Body: AuthBody }>(
        "/register",
        {
          schema: {
            body: AuthBodySchema,
          },
        },
        async (request, reply) => {
          const { email, password } = request.body;
          const normalizedEmail = normalizeEmail(email);
          const passwordHash = await deps.hasher.hash(password);
          const user = await deps.store.createUser(
            normalizedEmail,
            passwordHash,
          );

          return reply.status(201).send({ id: user.id, email: user.email });
        },
      );
      v1.post<{ Body: AuthBody }>(
        "/login",
        {
          schema: {
            body: AuthBodySchema,
          },
        },
        async (request, reply) => {
          const { email, password } = request.body;
          const normalizedEmail = normalizeEmail(email);
          const user = await deps.store.findUserByEmail(normalizedEmail);
          if (
            !user ||
            !(await deps.hasher.verify(password, user.passwordHash))
          ) {
            throw new AppError(
              401,
              "INVALID_CREDENTIALS",
              "Invalid credentials",
            );
          }
          const sid = randomUUID();
          await deps.session.createSession(
            sid,
            user.id,
            request.ip,
            Date.now(),
          );
          return reply.status(200).send({ sessionId: sid });
        },
      );
    },
    { prefix: "/api/v1" },
  );

  return app;
}

export { buildApp };
