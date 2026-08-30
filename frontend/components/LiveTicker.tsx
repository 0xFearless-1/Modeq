"use client";

import type { Case } from "@/lib/contract";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function LiveTicker({ cases }: { cases: Case[] }) {
  if (cases.length === 0) return null;

  const loop = [...cases, ...cases];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {loop.map((c, i) => (
          <div className="ticker-item" key={`${c.case_id}-${i}`}>
            <span className={`badge ${c.decision}`}>{c.decision}</span>
            <span className="ticker-text">&ldquo;{truncate(c.text, 60)}&rdquo;</span>
          </div>
        ))}
      </div>
    </div>
  );
}
