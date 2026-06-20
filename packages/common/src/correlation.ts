import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID } from "node:crypto";
import { IncomingMessage } from "node:http";

export function genCorrelationId(req: IncomingMessage) {
  const header = req.headers["x-correlation-id"];
  return (typeof header === "string" ? header : undefined) ?? randomUUID();
}

async function _correlationPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req, reply) => {
    reply.header("x-correlation-id", req.id);
  });
}

export const correlationPlugin = fastifyPlugin(_correlationPlugin);
