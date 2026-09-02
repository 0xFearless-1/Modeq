"use client";

import { studionet } from "genlayer-js/chains";
import { getStudioUrl } from "./client";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function isMetaMaskInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.ethereum?.isMetaMask;
}

const STUDIO_CHAIN_ID_HEX = `0x${studionet.id.toString(16)}`;

// genlayer-js skips its own chain-id check for Studio-based chains
// (see assertChainMatch in its client - `if (chainConfig.isStudio) return;`),
// so a wallet left on an unrelated network (e.g. Ethereum mainnet) would
// otherwise be asked to sign a transaction meant for GenLayer Studio against
// whatever chain it currently has active. Enforce the switch ourselves.
export async function ensureStudioNetwork(): Promise<void> {
  const currentChainId = await window.ethereum!.request({ method: "eth_chainId" });
  if (currentChainId === STUDIO_CHAIN_ID_HEX) return;

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: STUDIO_CHAIN_ID_HEX }],
    });
  } catch (err: any) {
    if (err?.code !== 4902) throw err;
    await window.ethereum!.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: STUDIO_CHAIN_ID_HEX,
          chainName: studionet.name,
          rpcUrls: [getStudioUrl()],
          nativeCurrency: studionet.nativeCurrency,
          blockExplorerUrls: [studionet.blockExplorers?.default.url],
        },
      ],
    });
  }
}

export async function getAuthorizedAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;
  const accounts: string[] = await window.ethereum!.request({ method: "eth_accounts" });
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

export async function connectMetaMask(): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed");
  }

  const accounts: string[] = await window.ethereum!.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found");
  }

  await ensureStudioNetwork();

  return accounts[0];
}

export function formatAddress(address: string | null, maxLength = 12): string {
  if (!address) return "";
  if (address.length <= maxLength) return address;

  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = Math.ceil((maxLength - 3) / 2);

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}
