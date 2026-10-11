import test from "node:test";
import assert from "node:assert/strict";
import { createCasesCache } from "./cases-cache.ts";

function setup(options: { ttlMs?: number } = {}) {
  let clock = 1_000;
  let calls = 0;
  let fail = false;
  let data = { total: 2, cases: ["a", "b"] };
  const cache = createCasesCache<string>({
    ttlMs: options.ttlMs ?? 10_000,
    now: () => clock,
    read: async () => {
      calls += 1;
      if (fail) throw new Error("upstream down");
      return data;
    },
  });
  return {
    cache,
    advance: (ms: number) => {
      clock += ms;
    },
    setFail: (value: boolean) => {
      fail = value;
    },
    setData: (value: typeof data) => {
      data = value;
    },
    calls: () => calls,
  };
}

test("reads upstream on the first request", async () => {
  const t = setup();
  const result = await t.cache.get();
  assert.equal(result?.stale, false);
  assert.deepEqual(result?.snapshot.cases, ["a", "b"]);
  assert.equal(t.calls(), 1);
});

test("serves from memory while the snapshot is fresh", async () => {
  const t = setup();
  await t.cache.get();
  t.advance(5_000);
  await t.cache.get();
  assert.equal(t.calls(), 1);
});

test("refreshes once the snapshot is older than the ttl", async () => {
  const t = setup();
  await t.cache.get();
  t.setData({ total: 3, cases: ["a", "b", "c"] });
  t.advance(10_000);
  const result = await t.cache.get();
  assert.equal(result?.snapshot.total, 3);
  assert.equal(t.calls(), 2);
});

test("concurrent requests share one upstream read", async () => {
  const t = setup();
  await Promise.all([t.cache.get(), t.cache.get(), t.cache.get()]);
  assert.equal(t.calls(), 1);
});

test("falls back to the old snapshot and marks it stale when upstream fails", async () => {
  const t = setup();
  await t.cache.get();
  t.advance(60_000);
  t.setFail(true);
  const result = await t.cache.get();
  assert.equal(result?.stale, true);
  assert.deepEqual(result?.snapshot.cases, ["a", "b"]);
  assert.equal(result?.snapshot.fetchedAt, 1_000);
});

test("returns null when upstream fails and nothing was ever read", async () => {
  const t = setup();
  t.setFail(true);
  assert.equal(await t.cache.get(), null);
});

test("a failed refresh keeps the snapshot and a later success replaces it", async () => {
  const t = setup();
  await t.cache.get();
  t.advance(20_000);
  t.setFail(true);
  await t.cache.get();
  t.setFail(false);
  t.setData({ total: 4, cases: ["a", "b", "c", "d"] });
  const result = await t.cache.get();
  assert.equal(result?.stale, false);
  assert.equal(result?.snapshot.total, 4);
});

test("peek exposes the last good snapshot without reading", async () => {
  const t = setup();
  assert.equal(t.cache.peek(), null);
  await t.cache.get();
  assert.equal(t.cache.peek()?.total, 2);
  assert.equal(t.calls(), 1);
});
