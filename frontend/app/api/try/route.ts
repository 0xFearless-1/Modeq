import { NextResponse } from "next/server";
import { getRelay, relayLimiter } from "@/lib/server/chain";
import { RELAY_MAX_LEN, validateRelayText } from "@/lib/server/relay-input";

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

function clientKey(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").pop()!.trim();
  return "unknown";
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function fail(message: string, status: number, extra: Record<string, string> = {}) {
  return NextResponse.json({ error: message }, { status, headers: { ...NO_STORE, ...extra } });
}

export async function GET() {
  const relay = getRelay();
  return NextResponse.json(
    relay
      ? { enabled: true, address: relay.address, maxLength: RELAY_MAX_LEN }
      : { enabled: false },
    { headers: NO_STORE },
  );
}

export async function POST(request: Request) {
  const relay = getRelay();
  if (!relay) return fail("The demo account is not enabled on this deployment.", 503);
  if (!sameOrigin(request)) return fail("Cross-site requests are not accepted.", 403);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("The request body must be JSON.", 400);
  }

  const input = validateRelayText((body as { text?: unknown } | null)?.text);
  if (!input.ok) return fail(input.message, 400);

  const verdict = relayLimiter().take(clientKey(request), Date.now());
  if (!verdict.ok) {
    const minutes = Math.max(1, Math.ceil(verdict.retryAfterSec / 60));
    const message =
      verdict.scope === "client"
        ? `Too many demo posts from your connection. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or connect a wallet.`
        : `The shared demo account is busy right now. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or connect a wallet.`;
    return fail(message, 429, { "Retry-After": String(verdict.retryAfterSec) });
  }

  try {
    const sent = await relay.submit(input.text);
    return NextResponse.json(sent, { headers: NO_STORE });
  } catch (error) {
    console.error("demo relay send failed:", error instanceof Error ? error.message : error);
    return fail(
      "Could not send from the demo account right now. Studio may be unavailable, please retry in a minute.",
      502,
    );
  }
}
