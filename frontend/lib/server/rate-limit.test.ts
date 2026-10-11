import test from "node:test";
import assert from "node:assert/strict";
import { createLimiter } from "./rate-limit.ts";

const RULES = {
  perClient: { limit: 2, windowMs: 10_000 },
  global: { limit: 3, windowMs: 60_000 },
};

test("allows requests up to the per-client limit", () => {
  const limiter = createLimiter(RULES);
  assert.deepEqual(limiter.take("a", 0), { ok: true });
  assert.deepEqual(limiter.take("a", 1_000), { ok: true });
});

test("blocks a client over its limit and says when to retry", () => {
  const limiter = createLimiter(RULES);
  limiter.take("a", 0);
  limiter.take("a", 1_000);
  const verdict = limiter.take("a", 2_000);
  assert.deepEqual(verdict, { ok: false, scope: "client", retryAfterSec: 8 });
});

test("a client is let in again once its window has passed", () => {
  const limiter = createLimiter(RULES);
  limiter.take("a", 0);
  limiter.take("a", 1_000);
  assert.equal(limiter.take("a", 10_000).ok, true);
});

test("other clients are not affected by one client's limit", () => {
  const limiter = createLimiter(RULES);
  limiter.take("a", 0);
  limiter.take("a", 1_000);
  assert.equal(limiter.take("b", 2_000).ok, true);
});

test("the global limit applies across clients", () => {
  const limiter = createLimiter(RULES);
  assert.equal(limiter.take("a", 0).ok, true);
  assert.equal(limiter.take("b", 1_000).ok, true);
  assert.equal(limiter.take("c", 2_000).ok, true);
  const verdict = limiter.take("d", 3_000);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.ok === false && verdict.scope, "global");
  assert.equal(verdict.ok === false && verdict.retryAfterSec, 57);
});

test("a rejected request does not use up quota", () => {
  const limiter = createLimiter(RULES);
  limiter.take("a", 0);
  limiter.take("a", 1_000);
  limiter.take("a", 2_000);
  limiter.take("a", 3_000);
  assert.equal(limiter.take("a", 10_000).ok, true);
});

test("many one-off clients are swept without losing active ones", () => {
  const limiter = createLimiter({
    perClient: { limit: 1, windowMs: 1_000 },
    global: { limit: 100_000, windowMs: 60_000 },
  });
  for (let i = 0; i < 600; i += 1) limiter.take(`k${i}`, 0);
  assert.equal(limiter.take("fresh", 5_000).ok, true);
  assert.equal(limiter.take("fresh", 5_100).ok, false);
});
