const FAUCET_AMOUNT = 1_000_000_000_000_000_000;

export type FaucetOptions = {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  attempts?: number;
  intervalMs?: number;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function rpc(
  rpcUrl: string,
  method: string,
  params: unknown[],
  fetchImpl: typeof fetch,
): Promise<unknown> {
  const response = await fetchImpl(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body?.error) {
    throw new Error(String(body.error.message ?? `${method} failed`));
  }
  return body?.result;
}

export async function requestTestGen(
  rpcUrl: string,
  checksumAddress: string,
  options: FaucetOptions = {},
): Promise<bigint> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const attempts = options.attempts ?? 8;
  const interval = options.intervalMs ?? 1500;

  await rpc(rpcUrl, "sim_fundAccount", [checksumAddress, FAUCET_AMOUNT], fetchImpl);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const raw = await rpc(
      rpcUrl,
      "eth_getBalance",
      [checksumAddress, "latest"],
      fetchImpl,
    );
    const balance =
      typeof raw === "string" && /^0x[0-9a-fA-F]+$/.test(raw) ? BigInt(raw) : 0n;
    if (balance > 0n) return balance;
    await sleep(interval);
  }

  throw new Error(
    "Funding was requested but the balance has not updated yet. Wait a few seconds and try again.",
  );
}

export function formatGen(wei: bigint): string {
  const whole = wei / 10n ** 18n;
  const fraction = (wei % 10n ** 18n)
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}
