import {
  correlationPlugin,
  createLogger,
  errorHandler,
  genCorrelationId,
} from "@corelab/common";
import Fastify from "fastify";
import { Type, Static } from "typebox";
import { Deps } from "./store.js";

const RegisterBodySchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8, maxLength: 200 }),
  },
  { additionalProperties: false },
);

const LoginBodySchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8, maxLength: 200 }),
  },
  { additionalProperties: false },
);

const UserResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
});

type RegisterBody = Static<typeof RegisterBodySchema>;

type LoginBody = Static<typeof LoginBodySchema>;

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
      v1.post<{ Body: RegisterBody }>(
        "/register",
        {
          schema: {
            body: RegisterBodySchema,
          },
        },
        async (request, reply) => {
          const { email, password } = request.body;
          const passwordHash = await deps.hasher.hash(password);
          const user = await deps.store.createUser(email, passwordHash);

          return reply.status(201).send({ id: user.id, email: user.email });
        },
      );
      v1.post<{ Body: LoginBody }>(
        "/login",
        {
          schema: {
            body: LoginBodySchema,
          },
        },
        async (request, reply) => {
          const { email, password } = request.body;
        },
      );
    },
    { prefix: "/api/v1" },
  );

  return app;
}

export { buildApp };
