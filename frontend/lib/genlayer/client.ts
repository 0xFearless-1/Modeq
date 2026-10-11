"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { getContractAddress, getStudioUrl } from "./config";

export { getContractAddress, getStudioUrl };

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
