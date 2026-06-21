import "dotenv/config";
import { Pool } from "pg";
import { buildApp } from "./app.js";
import { argon2Hasher, pgUserStore, sessionStore } from "./store.js";
import { Redis } from "ioredis";
import { createLogger } from "@corelab/common";

const log = createLogger("accounts");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redisServer = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
);
redisServer.on("error", (err) => {
  log.error({ err }, "redis connection error");
});
const app = buildApp({
  store: pgUserStore(pool),
  hasher: argon2Hasher,
  session: sessionStore(redisServer),
});
await app.listen({ port: 3001, host: "0.0.0.0" });
