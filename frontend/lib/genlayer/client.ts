"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export function getStudioUrl(): string {
  return process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
}

export function getContractAddress(): string {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
}

export function createGenLayerClient(account?: string) {
  const config: Record<string, unknown> = {
    chain: studionet,
    endpoint: getStudioUrl(),
  };

  if (account) {
    config.account = account as `0x${string}`;
  }

  return createClient(config as any);
}
