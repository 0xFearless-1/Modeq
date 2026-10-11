"use client";

import { createGenLayerClient, getContractAddress } from "./genlayer/client";
import { ensureStudioNetwork } from "./genlayer/wallet";
import { trackTransaction, type TxUpdate } from "./tx";

export type Decision = "ALLOW" | "FLAG" | "BLOCK";

export type Case = {
  case_id: number;
  submitter: string;
  text: string;
  categories: string[];
  primary_category: string;
  confidence_bps: number;
  decision: Decision;
  timestamp: number;
};

export async function getCase(caseId: number): Promise<Case> {
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: getContractAddress() as `0x${string}`,
    functionName: "get_case",
    args: [caseId],
  });
  return result as Case;
}

export type CasesRead = { cases: Case[]; snapshotAt: number | null };

type CasesSnapshotResponse = {
  total: number;
  cases: Case[];
  fetchedAt: number;
  stale: boolean;
};

async function readSnapshot(): Promise<CasesSnapshotResponse> {
  const res = await fetch("/api/cases", { cache: "no-store" });
  if (!res.ok) throw new Error(`Snapshot unavailable (${res.status})`);
  return (await res.json()) as CasesSnapshotResponse;
}

export async function listCasesWithMeta(offset: number, limit: number): Promise<CasesRead> {
  try {
    const client = createGenLayerClient();
    const result = await client.readContract({
      address: getContractAddress() as `0x${string}`,
      functionName: "list_cases",
      args: [offset, limit],
    });
    return { cases: (result as Case[]) ?? [], snapshotAt: null };
  } catch (liveError) {
    try {
      const snapshot = await readSnapshot();
      return {
        cases: snapshot.cases.slice(offset, offset + limit),
        snapshotAt: snapshot.fetchedAt,
      };
    } catch {
      throw liveError;
    }
  }
}

export async function listCases(offset: number, limit: number): Promise<Case[]> {
  return (await listCasesWithMeta(offset, limit)).cases;
}

export async function totalCases(): Promise<number> {
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: getContractAddress() as `0x${string}`,
    functionName: "total_cases",
    args: [],
  });
  return Number(result) || 0;
}

export async function submitContent(
  account: string,
  text: string,
  onUpdate: (update: TxUpdate) => void,
): Promise<number> {
  onUpdate({ phase: "network" });
  await ensureStudioNetwork();

  const countBefore = await totalCases();
  const client = createGenLayerClient(account);

  onUpdate({ phase: "signing" });
  const hash = await client.writeContract({
    address: getContractAddress() as `0x${string}`,
    functionName: "submit_content",
    args: [text],
    value: BigInt(0),
  });

  onUpdate({ phase: "consensus", hash, status: null, votes: null });
  await trackTransaction(
    client,
    hash as Parameters<typeof client.getTransaction>[0]["hash"],
    {
      onUpdate,
    },
  );
  return countBefore;
}

export async function findCaseSince(
  account: string,
  countBefore: number,
  text?: string,
): Promise<Case> {
  const wallet = account.toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const count = await totalCases();
    if (count > countBefore) {
      const fresh = await listCases(countBefore, count - countBefore);
      const mine = fresh.find(
        (c) => c.submitter.toLowerCase() === wallet && (text === undefined || c.text === text),
      );
      if (mine) return mine;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(
    "The transaction was accepted but the new case could not be read back yet. Open the audit log to see it.",
  );
}

export type RelaySent = { countBefore: number; submitter: string };

export async function submitViaRelay(
  text: string,
  onUpdate: (update: TxUpdate) => void,
): Promise<RelaySent> {
  onUpdate({ phase: "signing" });

  const res = await fetch("/api/try", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = (await res.json().catch(() => null)) as {
    hash?: string;
    submitter?: string;
    countBefore?: number;
    error?: string;
  } | null;

  if (!res.ok || !data?.hash || !data.submitter || typeof data.countBefore !== "number") {
    throw new Error(data?.error ?? `The demo account could not send the post (${res.status}).`);
  }

  onUpdate({ phase: "consensus", hash: data.hash, status: null, votes: null });
  const client = createGenLayerClient();
  await trackTransaction(
    client,
    data.hash as Parameters<typeof client.getTransaction>[0]["hash"],
    { onUpdate },
  );
  return { countBefore: data.countBefore, submitter: data.submitter };
}
