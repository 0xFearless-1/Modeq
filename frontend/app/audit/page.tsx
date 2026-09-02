"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listCases, type Case, type Decision } from "@/lib/contract";
import { getContractAddress } from "@/lib/genlayer/client";
import { formatAddress } from "@/lib/genlayer/wallet";
import { formatTimestamp } from "@/lib/format";
import { categoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

const FILTERS: { key: "all" | Decision; label: string }[] = [
  { key: "all", label: "All cases" },
  { key: "ALLOW", label: "ALLOW" },
  { key: "FLAG", label: "FLAG" },
  { key: "BLOCK", label: "BLOCK" },
];

function thresholdTrace(c: Case): string {
  const pct = (c.confidence_bps / 100).toFixed(0);
  if (c.primary_category === "none") {
    return `primary_category returned "none" - automatic ALLOW regardless of confidence.`;
  }
  if (c.confidence_bps > 7000) {
    return `${pct}% confidence exceeds the 70% BLOCK threshold for "${c.primary_category}".`;
  }
  if (c.confidence_bps > 4000) {
    return `${pct}% confidence falls in the 40-70% FLAG range for "${c.primary_category}".`;
  }
  return `${pct}% confidence is below the 40% threshold, so it still resolves to ALLOW.`;
}

export default function AuditLogPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Decision>("all");
  const [reveal, setReveal] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const rows = useMemo(
    () => cases.filter((c) => filter === "all" || c.decision === filter),
    [cases, filter]
  );

  return (
    <>
      <div className="audit-header">
        <div className="app-header" style={{ padding: 0 }}>
          <h1>Public audit log</h1>
          <p>
            Every decision Modeq has ever made. No wallet, no account, no rate limit.
            Blocked content is hidden from the feed by default - the record of it never is.
          </p>
        </div>
        <div className="audit-registry-meta">
          <div>registry {formatAddress(getContractAddress(), 16)}</div>
          <div>{cases.length} records - append-only</div>
        </div>
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
          <div className="audit-toolbar">
            <div className="audit-chips">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`audit-chip ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="audit-reveal">
              <input
                type="checkbox"
                checked={reveal}
                onChange={(e) => setReveal(e.target.checked)}
              />
              Reveal blocked content
            </label>
          </div>

          {!narrow && (
            <div className="audit-table-head">
              <span>Case</span>
              <span>Content</span>
              <span>Category</span>
              <span>Conf.</span>
              <span>Verdict</span>
            </div>
          )}

          <div className="audit-table">
            {rows.map((c) => {
              const isBlocked = c.decision === "BLOCK";
              const hidden = isBlocked && !reveal;
              const catMeta = categoryMeta(c.primary_category);
              const isOpen = openId === c.case_id;
              const contentLabel = hidden
                ? `content hidden - blocked for ${catMeta.label.toLowerCase()}`
                : c.text;

              return (
                <div key={c.case_id} className={`audit-row-wrap ${c.decision}`}>
                  <div
                    className="audit-row"
                    onClick={() => setOpenId(isOpen ? null : c.case_id)}
                  >
                    {narrow ? (
                      <>
                        <div className="audit-row-top">
                          <span className="audit-case-id">#{c.case_id}</span>
                          <span className="audit-verdict">{c.decision}</span>
                        </div>
                        <div className={`audit-content ${hidden ? "hidden" : ""}`}>
                          {contentLabel}
                        </div>
                        <div className="audit-row-bottom">
                          <span>{c.primary_category === "none" ? "-" : catMeta.label}</span>
                          <span>conf {(c.confidence_bps / 100).toFixed(0)}%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="audit-case-id">#{c.case_id}</span>
                        <span className={`audit-content ${hidden ? "hidden" : ""}`}>
                          {contentLabel}
                        </span>
                        <span className="audit-category">
                          {c.primary_category === "none" ? "-" : catMeta.label}
                        </span>
                        <span className="audit-conf">
                          {(c.confidence_bps / 100).toFixed(0)}%
                        </span>
                        <span className="audit-verdict">{c.decision}</span>
                      </>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="audit-detail"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div className="audit-detail-grid">
                          <div>
                            <div className="audit-detail-label">Why this verdict</div>
                            <p className="audit-trace-line">{thresholdTrace(c)}</p>
                            <p className="audit-trace-line">
                              Confirmed by 5 independent GenLayer validators - this case
                              could not have reached ACCEPTED otherwise.
                            </p>
                          </div>
                          <div>
                            <div className="audit-detail-label">Record</div>
                            <div className="audit-detail-meta">
                              <div>submitter {formatAddress(c.submitter)}</div>
                              <div>case #{c.case_id}</div>
                              <div>{formatTimestamp(c.timestamp)}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="audit-count">
            {rows.length} of {cases.length} records shown - the log cannot be edited or
            pruned
          </div>
        </>
      )}
    </>
  );
}
