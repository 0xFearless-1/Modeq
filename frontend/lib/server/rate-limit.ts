export type Rule = { limit: number; windowMs: number };

export type Verdict =
  | { ok: true }
  | { ok: false; scope: "client" | "global"; retryAfterSec: number };

export type LimiterRules = { perClient: Rule; global: Rule };

function prune(hits: number[], windowMs: number, now: number): number[] {
  return hits.filter((at) => now - at < windowMs);
}

function retryAfter(hits: number[], windowMs: number, now: number): number {
  const oldest = hits[0];
  return Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
}

export function createLimiter(rules: LimiterRules) {
  const perClient = new Map<string, number[]>();
  let globalHits: number[] = [];

  function sweep(now: number) {
    if (perClient.size < 500) return;
    for (const [key, hits] of perClient) {
      if (prune(hits, rules.perClient.windowMs, now).length === 0) perClient.delete(key);
    }
  }

  function take(key: string, now: number): Verdict {
    sweep(now);

    globalHits = prune(globalHits, rules.global.windowMs, now);
    if (globalHits.length >= rules.global.limit) {
      return {
        ok: false,
        scope: "global",
        retryAfterSec: retryAfter(globalHits, rules.global.windowMs, now),
      };
    }

    const own = prune(perClient.get(key) ?? [], rules.perClient.windowMs, now);
    if (own.length >= rules.perClient.limit) {
      perClient.set(key, own);
      return {
        ok: false,
        scope: "client",
        retryAfterSec: retryAfter(own, rules.perClient.windowMs, now),
      };
    }

    own.push(now);
    perClient.set(key, own);
    globalHits.push(now);
    return { ok: true };
  }

  return { take };
}
