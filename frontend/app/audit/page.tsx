"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { DecisionBar } from "@/components/DecisionBar";

export default function AuditLogPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const count = await totalCases();
        const all = await listCases(0, count);
        setCases(all.slice().reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
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

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {loading && <p className="muted">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && cases.length === 0 && (
          <p className="muted">No cases submitted yet.</p>
        )}

        {cases.length > 0 && (
          <>
            <DecisionBar allow={allow} flag={flag} block={block} />
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Text</th>
                  <th>Category</th>
                  <th>Confidence</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <motion.tr
                    key={c.case_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.6) }}
                  >
                    <td>{c.case_id}</td>
                    <td>{c.text}</td>
                    <td>{c.primary_category}</td>
                    <td>{(c.confidence_bps / 100).toFixed(0)}%</td>
                    <td>
                      <span className={`badge ${c.decision}`}>{c.decision}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </motion.div>
    </>
  );
}
