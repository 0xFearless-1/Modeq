import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { getContractAddress, getStudioUrl } from "../genlayer/config.ts";
import { createCasesCache } from "./cases-cache.ts";
import { createLimiter } from "./rate-limit.ts";

const MAX_CASES = 200;
const CASES_TTL_MS = 30_000;
const WARMUP_INTERVAL_MS = 60_000;

type RelaySend = { hash: string; submitter: string; countBefore: number };

export type Relay = {
  address: string;
  submit: (text: string) => Promise<RelaySend>;
};

type ChainGlobals = {
  __modeqRelay?: Relay | null;
  __modeqCases?: ReturnType<typeof createCasesCache<unknown>>;
  __modeqLimiter?: ReturnType<typeof createLimiter>;
  __modeqWarm?: ReturnType<typeof setInterval>;
};

const store = globalThis as unknown as ChainGlobals;

function readClient() {
  return createClient({ chain: studionet, endpoint: getStudioUrl() });
}

function contract() {
  return getContractAddress() as `0x${string}`;
}

async function readAllCases() {
  const client = readClient();
  const total =
    Number(
      await client.readContract({
        address: contract(),
        functionName: "total_cases",
        args: [],
      }),
    ) || 0;
  const cases =
    total > 0
      ? ((await client.readContract({
          address: contract(),
          functionName: "list_cases",
          args: [0, Math.min(total, MAX_CASES)],
        })) as unknown[])
      : [];
  return { total, cases };
}

export function casesCache() {
  if (!store.__modeqCases) {
    store.__modeqCases = createCasesCache<unknown>({
      read: readAllCases,
      ttlMs: CASES_TTL_MS,
      now: Date.now,
    });
  }
  return store.__modeqCases;
}

export function startCasesWarmup() {
  if (store.__modeqWarm) return;
  const cache = casesCache();
  cache.refresh().catch(() => undefined);
  store.__modeqWarm = setInterval(() => {
    cache.refresh().catch(() => undefined);
  }, WARMUP_INTERVAL_MS);
  store.__modeqWarm.unref();
}

export function relayLimiter() {
  if (!store.__modeqLimiter) {
    store.__modeqLimiter = createLimiter({
      perClient: { limit: 3, windowMs: 10 * 60_000 },
      global: { limit: 30, windowMs: 60 * 60_000 },
    });
  }
  return store.__modeqLimiter;
}

function buildRelay(): Relay | null {
  const key = process.env.MODEQ_RELAYER_PRIVATE_KEY;
  if (!key || !/^0x[0-9a-fA-F]{64}$/.test(key)) return null;

  const account = createAccount(key as `0x${string}`);
  const client = createClient({ chain: studionet, endpoint: getStudioUrl(), account });
  let queue: Promise<unknown> = Promise.resolve();

  function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = queue.then(job, job);
    queue = run.catch(() => undefined);
    return run;
  }

  return {
    address: account.address,
    submit: (text) =>
      enqueue(async () => {
        const countBefore =
          Number(
            await client.readContract({
              address: contract(),
              functionName: "total_cases",
              args: [],
            }),
          ) || 0;
        const hash = await client.writeContract({
          address: contract(),
          functionName: "submit_content",
          args: [text],
          value: BigInt(0),
        });
        return { hash, submitter: account.address, countBefore };
      }),
  };
}

export function getRelay(): Relay | null {
  if (store.__modeqRelay === undefined) store.__modeqRelay = buildRelay();
  return store.__modeqRelay;
}
