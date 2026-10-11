import { NextResponse } from "next/server";
import { casesCache } from "@/lib/server/chain";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await casesCache().get();
  if (!result) {
    return NextResponse.json(
      { error: "The case list is not available yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(
    {
      total: result.snapshot.total,
      cases: result.snapshot.cases,
      fetchedAt: result.snapshot.fetchedAt,
      stale: result.stale,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
