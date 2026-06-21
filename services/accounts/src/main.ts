import "dotenv/config";
import { Pool } from "pg";
import { buildApp } from "./app.js";
import { argon2Hasher, pgUserStore } from "./store.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = buildApp({ store: pgUserStore(pool), hasher: argon2Hasher });
await app.listen({ port: 3001, host: "0.0.0.0" });
