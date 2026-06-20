import {
  correlationPlugin,
  createLogger,
  errorHandler,
  genCorrelationId,
} from "@corelab/common";
import Fastify from "fastify";

function buildApp() {
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

  return app;
}

export { buildApp };
