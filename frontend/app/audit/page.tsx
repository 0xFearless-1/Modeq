"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Eye, AlertTriangle } from "lucide-react";
import { listCases, type Case } from "@/lib/contract";
import { DecisionBar } from "@/components/DecisionBar";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { formatTimestamp } from "@/lib/format";
import { categoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default function AuditLogPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const all = await listCases(0, 100);
        if (cancelled) return;
        setCases(all.slice().reverse());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    const id = setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function toggleReveal(caseId: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(caseId)) next.delete(caseId);
      else next.add(caseId);
      return next;
    });
  }

  const allow = cases.filter((c) => c.decision === "ALLOW").length;
  const flag = cases.filter((c) => c.decision === "FLAG").length;
  const block = cases.filter((c) => c.decision === "BLOCK").length;

  return (
    <>
      <div className="app-header">
        <h1>Community feed</h1>
        <p>
          This is what the community actually sees. <strong>BLOCKED</strong> posts are
          hidden from the feed by default - toggle "show original" to audit what was
          removed and why. Nothing is deleted: every decision stays public on-chain.
        </p>
      </div>

      {loading && (
        <div className="panel">
          <p className="muted">Loading...</p>
        </div>
      )}
      {error && (
        <div className="panel">
          <p className="error" style={{ marginTop: 0 }}>
            {error}
          </p>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="panel">
          <p className="muted">No cases submitted yet.</p>
        </div>
      )}

      {cases.length > 0 && (
        <>
          <div className="panel">
            <DecisionBar allow={allow} flag={flag} block={block} />
            <CategoryBreakdown cases={cases} />
          </div>

          <div className="case-feed">
            {cases.map((c, i) => {
              const isBlocked = c.decision === "BLOCK";
              const isFlagged = c.decision === "FLAG";
              const isRevealed = revealed.has(c.case_id);
              const catMeta = categoryMeta(c.primary_category);
              const CatIcon = catMeta.icon;

              return (
                <motion.div
                  key={c.case_id}
                  className={`case-card ${c.decision}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.6) }}
                >
                  <div className="case-card-top">
                    <span className={`badge ${c.decision}`}>
                      {isBlocked ? "removed from feed" : c.decision}
                    </span>
                    <span className={`category-chip inline ${c.primary_category}`}>
                      <CatIcon size={13} strokeWidth={2} />
                      {catMeta.label}
                    </span>
                    <span className="case-meta">
                      post #{c.case_id} - {(c.confidence_bps / 100).toFixed(0)}% confidence -{" "}
                      {formatTimestamp(c.timestamp)}
                    </span>
                  </div>

                  {isFlagged && (
                    <div className="flag-banner">
                      <AlertTriangle size={13} strokeWidth={2} />
                      Flagged for review - still visible to the community
                    </div>
                  )}

                  {isBlocked && !isRevealed ? (
                    <button
                      className="reveal-toggle"
                      onClick={() => toggleReveal(c.case_id)}
                    >
                      <Eye size={13} strokeWidth={2} />
                      Show original post (audit)
                    </button>
                  ) : (
                    <p className="case-text">{c.text}</p>
                  )}

                  {isBlocked && isRevealed && (
                    <button
                      className="reveal-toggle"
                      onClick={() => toggleReveal(c.case_id)}
                    >
                      <EyeOff size={13} strokeWidth={2} />
                      Hide again
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
