import { correlationPlugin, createLogger, errorHandler } from "@corelab/common";
import Fastify from "fastify";

function buildApp() {
  const app = Fastify({ loggerInstance: createLogger("accounts") });
  app.setErrorHandler(errorHandler);
  app.register(correlationPlugin);
  app.get("/health", async () => ({
    status: "ok",
  }));

  return app;
}

export { buildApp };
