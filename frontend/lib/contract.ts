"use client";

import { createGenLayerClient, getContractAddress } from "./genlayer/client";

export type Decision = "ALLOW" | "FLAG" | "BLOCK";

export type Case = {
  case_id: number;
  submitter: string;
  text: string;
  categories: string[];
  primary_category: string;
  confidence_bps: number;
  decision: Decision;
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

export async function submitContent(account: string, text: string): Promise<void> {
  const client = createGenLayerClient(account);
  const txHash = await client.writeContract({
    address: getContractAddress() as `0x${string}`,
    functionName: "submit_content",
    args: [text],
    value: BigInt(0),
  });

  await client.waitForTransactionReceipt({
    hash: txHash,
    status: "ACCEPTED" as any,
    retries: 40,
    interval: 5000,
  });
}
