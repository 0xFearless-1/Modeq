export type CasesData<T> = { total: number; cases: T[] };

export type CasesSnapshot<T> = CasesData<T> & { fetchedAt: number };

export type CasesResult<T> = { snapshot: CasesSnapshot<T>; stale: boolean };

export type CacheOptions<T> = {
  read: () => Promise<CasesData<T>>;
  ttlMs: number;
  now: () => number;
};

export function createCasesCache<T>({ read, ttlMs, now }: CacheOptions<T>) {
  let snapshot: CasesSnapshot<T> | null = null;
  let inflight: Promise<CasesSnapshot<T>> | null = null;

  function refresh(): Promise<CasesSnapshot<T>> {
    if (inflight) return inflight;
    inflight = (async () => {
      try {
        const data = await read();
        snapshot = { ...data, fetchedAt: now() };
        return snapshot;
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  async function get(): Promise<CasesResult<T> | null> {
    if (snapshot && now() - snapshot.fetchedAt < ttlMs) {
      return { snapshot, stale: false };
    }
    try {
      return { snapshot: await refresh(), stale: false };
    } catch {
      return snapshot ? { snapshot, stale: true } : null;
    }
  }

  function peek(): CasesSnapshot<T> | null {
    return snapshot;
  }

  return { get, refresh, peek };
}
