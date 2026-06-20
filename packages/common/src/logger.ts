import pino from "pino";

function createLogger(name: string) {
  return pino({
    name,
    level: "info",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "email",
      ],
      censor: "[REDACTED]",
    },
  });
}

export { createLogger };
