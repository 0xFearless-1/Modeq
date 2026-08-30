"use client";

import { useEffect, useState } from "react";
import { listCases, totalCases, type Case } from "@/lib/contract";

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

  return (
    <div className="panel">
      <p className="muted">
        Every moderation decision is public and on-chain - no wallet required to view it.
      </p>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && cases.length === 0 && (
        <p className="muted">No cases submitted yet.</p>
      )}

      {cases.length > 0 && (
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
            {cases.map((c) => (
              <tr key={c.case_id}>
                <td>{c.case_id}</td>
                <td>{c.text}</td>
                <td>{c.primary_category}</td>
                <td>{(c.confidence_bps / 100).toFixed(0)}%</td>
                <td>
                  <span className={`badge ${c.decision}`}>{c.decision}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
