import test from "node:test";
import assert from "node:assert/strict";
import { formatGen, requestTestGen } from "./faucet.ts";

const ADDRESS = "0x8242334836D89070a88a869D68aC8fA74c9F7Bb6";

function stub(balances: string[], fundError?: string) {
  const calls: { method: string; params: unknown[] }[] = [];
  let polled = 0;
  const fetchImpl = (async (_url: string, init: { body: string }) => {
    const { method, params } = JSON.parse(init.body);
    calls.push({ method, params });
    if (method === "sim_fundAccount") {
      return {
        json: async () =>
          fundError ? { error: { message: fundError } } : { result: "0xabc" },
      };
    }
    const result = balances[Math.min(polled, balances.length - 1)];
    polled += 1;
    return { json: async () => ({ result }) };
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

const noSleep = async () => {};

test("funds the checksummed address and returns the credited balance", async () => {
  const { fetchImpl, calls } = stub(["0x0", "0x0", "0xde0b6b3a7640000"]);
  const balance = await requestTestGen("http://rpc", ADDRESS, {
    fetchImpl,
    sleep: noSleep,
  });
  assert.equal(balance, 10n ** 18n);
  assert.deepEqual(calls[0], { method: "sim_fundAccount", params: [ADDRESS, 1e18] });
  assert.equal(calls.filter((c) => c.method === "eth_getBalance").length, 3);
});

test("surfaces an RPC error from the funding call", async () => {
  const { fetchImpl } = stub(["0x0"], "faucet disabled");
  await assert.rejects(
    requestTestGen("http://rpc", ADDRESS, { fetchImpl, sleep: noSleep }),
    /faucet disabled/,
  );
});

test("gives up with a clear message when the balance never updates", async () => {
  const { fetchImpl, calls } = stub(["0x0"]);
  await assert.rejects(
    requestTestGen("http://rpc", ADDRESS, { fetchImpl, sleep: noSleep, attempts: 3 }),
    /balance has not updated yet/,
  );
  assert.equal(calls.filter((c) => c.method === "eth_getBalance").length, 3);
});

test("formats wei as a short GEN amount", () => {
  assert.equal(formatGen(10n ** 18n), "1");
  assert.equal(formatGen(1999350000000000000n), "1.9993");
  assert.equal(formatGen(500000000000000000n), "0.5");
  assert.equal(formatGen(0n), "0");
});
