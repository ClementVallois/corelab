import assert from "node:assert";
import { buildApp } from "./app.js";
import { Hasher, UserStore } from "./store.js";
import test from "node:test";

function inMemoryStore(): UserStore {
  const byEmail = new Map<string, any>();
  return {
    async createUser(email, passwordHash) {
      const user = { id: crypto.randomUUID(), email, passwordHash };
      byEmail.set(email, user);
      return { id: user.id, email: user.email };
    },
    async findUserByEmail(email) {
      return byEmail.get(email) ?? null;
    },
  };
}

const fakeHasher: Hasher = {
  hash: async (plain) => `hashed:${plain}`,

  verify: async (plain, hash) => hash === `hashed:${plain}`,
};

test("register creates a user", async () => {
  const app = buildApp({ store: inMemoryStore(), hasher: fakeHasher });

  const res = await app.inject({
    method: "POST",
    url: "/api/v1/register",
    payload: { email: "toto@toto.fr", password: "password1234" },
  });
  assert.equal(res.statusCode, 201);
  assert.equal(res.json().email, "toto@toto.fr");
});
