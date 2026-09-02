"use client";

import { categoryMeta } from "@/lib/categories";
import type { Case } from "@/lib/contract";

export function CategoryBreakdown({ cases }: { cases: Case[] }) {
  const counts = new Map<string, number>();
  for (const c of cases) {
    counts.set(c.primary_category, (counts.get(c.primary_category) ?? 0) + 1);
  }

  const entries = Array.from(counts.entries())
    .filter(([key]) => key !== "none")
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <>
      <span className="category-breakdown-label">Flagged or blocked for</span>
      <div className="category-breakdown">
        {entries.map(([key, count]) => {
          const meta = categoryMeta(key);
          return (
            <span key={key} className={`category-chip ${key}`}>
              <meta.icon size={13} strokeWidth={2} />
              {meta.label}
              <strong>{count}</strong>
            </span>
          );
        })}
      </div>
    </>
  );
}
