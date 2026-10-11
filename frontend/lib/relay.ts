"use client";

export type RelayInfo =
  | { enabled: true; address: string; maxLength: number }
  | { enabled: false };

const DISABLED: RelayInfo = { enabled: false };

let pending: Promise<RelayInfo> | null = null;

export function loadRelayInfo(): Promise<RelayInfo> {
  if (!pending) {
    pending = fetch("/api/try", { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<RelayInfo>) : DISABLED))
      .catch(() => DISABLED)
      .then((info) => {
        if (!info.enabled) pending = null;
        return info;
      });
  }
  return pending;
}

export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase());
}
