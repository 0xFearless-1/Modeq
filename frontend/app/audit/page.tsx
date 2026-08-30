"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { DecisionBar } from "@/components/DecisionBar";

export const dynamic = "force-dynamic";

export default function AuditLogPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const count = await totalCases();
        const all = await listCases(0, count);
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

  const allow = cases.filter((c) => c.decision === "ALLOW").length;
  const flag = cases.filter((c) => c.decision === "FLAG").length;
  const block = cases.filter((c) => c.decision === "BLOCK").length;

  return (
    <>
      <div className="app-header">
        <h1>Audit log</h1>
        <p>
          Every moderation decision is public and on-chain - no wallet required to view
          it.
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
          </div>

          <div className="case-feed">
            {cases.map((c, i) => (
              <motion.div
                key={c.case_id}
                className={`case-card ${c.decision}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.6) }}
              >
                <div className="case-card-top">
                  <span className={`badge ${c.decision}`}>{c.decision}</span>
                  <span className="case-meta">
                    case #{c.case_id} - {c.primary_category} -{" "}
                    {(c.confidence_bps / 100).toFixed(0)}% confidence
                  </span>
                </div>
                <p className="case-text">{c.text}</p>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
