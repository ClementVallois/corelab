import { Pool } from "pg";
import argon2 from "argon2";

export type User = { id: string; email: string };
export type UserWithHash = User & { passwordHash: string };

export interface UserStore {
  createUser(email: string, passwordHash: string): Promise<User>;
  findUserByEmail(email: string): Promise<UserWithHash>;
}
export interface Hasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export interface Deps {
  store: UserStore;
  hasher: Hasher;
}

export function pgUserStore(pool: Pool): UserStore {
  return {
    async createUser(email, passwordHash) {
      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash)
        VALUES ($1, $2) RETURNING id, email`,
        [email, passwordHash],
      );
      return rows[0];
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
