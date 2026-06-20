import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID } from "node:crypto";

async function _correlationPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (req, reply) => {
    const correlationId = req.headers["x-correlation-id"] ?? randomUUID();
    req.log = req.log.child({ correlationId });
    reply.header("x-correlation-id", correlationId);
  });
}

export const correlationPlugin = fastifyPlugin(_correlationPlugin);
