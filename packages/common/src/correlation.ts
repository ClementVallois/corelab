import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID } from "node:crypto";
import { IncomingMessage } from "node:http";

export function genCorrelationId(request: IncomingMessage) {
  const header = request.headers["x-correlation-id"];
  return (typeof header === "string" ? header : undefined) ?? randomUUID();
}

async function _correlationPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-correlation-id", request.id);
  });
}

export const correlationPlugin = fastifyPlugin(_correlationPlugin);
