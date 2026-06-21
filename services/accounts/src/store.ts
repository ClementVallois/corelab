import { Pool } from "pg";
import argon2 from "argon2";
import { AppError } from "@corelab/common";
import type { Redis } from "ioredis";

const SESSION_TTL = 3600;

export type User = { id: string; email: string };
export type UserWithHash = User & { passwordHash: string };
export type Session = {
  sid: string;
  userId: string;
  ip: string;
  createdAt: string;
};

export interface UserStore {
  createUser(email: string, passwordHash: string): Promise<User>;
  findUserByEmail(email: string): Promise<UserWithHash>;
}
export interface Hasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface SessionStore {
  createSession(
    sid: string,
    userId: string,
    ip: string,
    createdAt: string,
  ): Promise<Session>;
  getSession(sid: string): Promise<Session | null>;
  deleteSession(sid: string): Promise<void>;
  listForUser(userId: string): Promise<Session[]>;
  deleteAllForUser(userId: string): Promise<void>;
}

export interface Deps {
  store: UserStore;
  hasher: Hasher;
  session: SessionStore;
}

export function pgUserStore(pool: Pool): UserStore {
  return {
    async createUser(email, passwordHash) {
      try {
        const { rows } = await pool.query(
          `INSERT INTO users (email, password_hash)
        VALUES ($1, $2) RETURNING id, email`,
          [email, passwordHash],
        );
        return rows[0];
      } catch (err: any) {
        if (err.code === "23505") {
          throw new AppError(
            409,
            "EMAIL_ALREADY_TAKEN",
            "Email already registered",
          );
        }
        throw err;
      }
    },

    async findUserByEmail(email) {
      const { rows } = await pool.query(
        `SELECT id, email, password_hash as "passwordHash"
        FROM users where email = $1`,
        [email],
      );
      return rows[0] ?? null;
    },
  };
}

export const argon2Hasher: Hasher = {
  hash: (plain) => argon2.hash(plain),
  verify: (plain, hash) => argon2.verify(hash, plain),
};

export function sessionStore(redis: Redis): SessionStore {
  return {
    async createSession(sid, userId, ip, createdAt) {
      const results = await redis
        .multi()
        .hset(`session:${sid}`, { userId, ip, createdAt })
        .expire(`session:${sid}`, SESSION_TTL)
        .sadd(`user:${userId}:sessions`, sid)
        .exec();
      if (!results) {
        throw new Error("Transaction aborted");
      }
      return { sid, userId, ip, createdAt };
    },
    async getSession() {},
    async deleteSession() {},
    async listForUser() {},
    async deleteAllForUser() {},
  };
}
