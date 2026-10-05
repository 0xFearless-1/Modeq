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

export async function listCases(offset: number, limit: number): Promise<Case[]> {
  const client = createGenLayerClient();
  const result = await client.readContract({
    address: getContractAddress() as `0x${string}`,
    functionName: "list_cases",
    args: [offset, limit],
  });
  return (result as Case[]) ?? [];
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

export async function findCaseSince(account: string, countBefore: number): Promise<Case> {
  const wallet = account.toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const count = await totalCases();
    if (count > countBefore) {
      const fresh = await listCases(countBefore, count - countBefore);
      const mine = fresh.find((c) => c.submitter.toLowerCase() === wallet);
      if (mine) return mine;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error(
    "The transaction was accepted but the new case could not be read back yet. Open the audit log to see it.",
  );
}
