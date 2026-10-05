"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listCases, type Case, type Decision } from "@/lib/contract";
import { getContractAddress } from "@/lib/genlayer/client";
import { formatAddress } from "@/lib/genlayer/wallet";
import { formatTimestamp } from "@/lib/format";
import { categoryMeta } from "@/lib/categories";

export const dynamic = "force-dynamic";

const EASE = [0.23, 1, 0.32, 1] as const;

type Filter = "all" | Decision;

const FILTERS: { key: Filter; label: string }[] = [
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

function parseFilter(value: string | null): Filter {
  return value === "ALLOW" || value === "FLAG" || value === "BLOCK" ? value : "all";
}

export default function AuditLogPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [reveal, setReveal] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [narrow, setNarrow] = useState(false);
  const pendingScroll = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 760);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFilter(parseFilter(params.get("verdict")));
    const match = window.location.hash.match(/^#case-(\d+)$/);
    if (match) {
      const id = Number(match[1]);
      setOpenId(id);
      pendingScroll.current = id;
    }
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

  useEffect(() => {
    const id = pendingScroll.current;
    if (id === null || cases.length === 0) return;
    pendingScroll.current = null;
    requestAnimationFrame(() => {
      document.getElementById(`case-${id}`)?.scrollIntoView({ block: "center" });
    });
  }, [cases]);

  function syncUrl(nextFilter: Filter, nextOpen: number | null) {
    const url = new URL(window.location.href);
    if (nextFilter === "all") url.searchParams.delete("verdict");
    else url.searchParams.set("verdict", nextFilter);
    url.hash = nextOpen === null ? "" : `case-${nextOpen}`;
    window.history.replaceState(null, "", url);
  }

  function chooseFilter(next: Filter) {
    setFilter(next);
    syncUrl(next, openId);
  }

  function toggleRow(id: number) {
    const next = openId === id ? null : id;
    setOpenId(next);
    syncUrl(filter, next);
  }

  const counts = useMemo(
    () => ({
      all: cases.length,
      ALLOW: cases.filter((c) => c.decision === "ALLOW").length,
      FLAG: cases.filter((c) => c.decision === "FLAG").length,
      BLOCK: cases.filter((c) => c.decision === "BLOCK").length,
    }),
    [cases],
  );

  const rows = useMemo(
    () => cases.filter((c) => filter === "all" || c.decision === filter),
    [cases, filter],
  );

  return (
    <>
      <div className="audit-header">
        <div className="app-header" style={{ padding: 0 }}>
          <span className="eyebrow">Public registry</span>
          <h1>Public audit log</h1>
          <p>
            Every decision Modeq has ever made. No wallet, no account, no rate limit.
            Blocked content is hidden from the feed by default - the record of it never
            is.
          </p>
        </div>
        <div className="audit-registry-meta">
          <div translate="no">registry {formatAddress(getContractAddress(), 16)}</div>
          <div>{cases.length} records - append-only</div>
        </div>
      </div>

      {loading && (
        <div className="panel">
          <p className="muted">Loading records from the chain…</p>
        </div>
      )}
      {error && (
        <div className="panel">
          <p className="error" role="alert" style={{ marginTop: 0 }}>
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
          <motion.div
            className="bezel audit-summary-wrap"
            style={{ marginTop: "1.75rem" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="bezel-core">
              <div className="audit-summary" style={{ marginTop: 0 }}>
                <div className="audit-stat">
                  <span className="audit-stat-label">Total records</span>
                  <span className="audit-stat-value">{counts.all}</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-label">
                    <i className="dot-legend allow" style={{ margin: 0 }} />
                    Allowed
                  </span>
                  <span className="audit-stat-value allow">{counts.ALLOW}</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-label">
                    <i className="dot-legend flag" style={{ margin: 0 }} />
                    Flagged
                  </span>
                  <span className="audit-stat-value flag">{counts.FLAG}</span>
                </div>
                <div className="audit-stat">
                  <span className="audit-stat-label">
                    <i className="dot-legend block" style={{ margin: 0 }} />
                    Blocked
                  </span>
                  <span className="audit-stat-value block">{counts.BLOCK}</span>
                </div>
              </div>
              <div className="audit-dist" aria-hidden="true">
                {(["allow", "flag", "block"] as const).map((k, i) => {
                  const n = counts[k.toUpperCase() as Decision];
                  if (n === 0) return null;
                  return (
                    <motion.div
                      key={k}
                      className={`audit-dist-seg ${k}`}
                      style={{ flex: `${n} 1 0` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.25 + i * 0.1, ease: EASE }}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>

          <div className="audit-toolbar">
            <div className="audit-chips" role="group" aria-label="Filter by verdict">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={filter === f.key}
                  className={`audit-chip ${filter === f.key ? "active" : ""}`}
                  onClick={() => chooseFilter(f.key)}
                >
                  {f.label}
                  <span className="audit-chip-count">{counts[f.key]}</span>
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

          <div className="bezel">
            <div className="bezel-core">
              {!narrow && (
                <div className="audit-table-head" aria-hidden="true">
                  <span>Case</span>
                  <span>Content</span>
                  <span>Category</span>
                  <span>Conf.</span>
                  <span>Verdict</span>
                </div>
              )}

              {rows.length === 0 && (
                <p className="muted" style={{ padding: "1.5rem 1.25rem", margin: 0 }}>
                  No {filter} cases in the log yet.
                </p>
              )}

              {rows.map((c, i) => {
                const isBlocked = c.decision === "BLOCK";
                const hidden = isBlocked && !reveal;
                const catMeta = categoryMeta(c.primary_category);
                const isOpen = openId === c.case_id;
                const contentLabel = hidden
                  ? `content hidden - blocked for ${catMeta.label.toLowerCase()}`
                  : c.text;

                return (
                  <motion.div
                    key={c.case_id}
                    id={`case-${c.case_id}`}
                    className={`audit-row-wrap ${c.decision}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(i, 12) * 0.03,
                      ease: EASE,
                    }}
                  >
                    <button
                      type="button"
                      className="audit-row"
                      aria-expanded={isOpen}
                      aria-controls={`case-detail-${c.case_id}`}
                      onClick={() => toggleRow(c.case_id)}
                    >
                      {narrow ? (
                        <>
                          <span className="audit-row-top">
                            <span className="audit-case-id">#{c.case_id}</span>
                            <span className="audit-verdict">{c.decision}</span>
                          </span>
                          <span className={`audit-content ${hidden ? "hidden" : ""}`}>
                            {contentLabel}
                          </span>
                          <span className="audit-row-bottom">
                            <span>
                              {c.primary_category === "none" ? "-" : catMeta.label}
                            </span>
                            <span>conf {(c.confidence_bps / 100).toFixed(0)}%</span>
                          </span>
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
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`case-detail-${c.case_id}`}
                          className="audit-detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: EASE }}
                        >
                          <div className="audit-detail-grid">
                            <div>
                              <div className="audit-detail-label">Why this verdict</div>
                              <p className="audit-trace-line">{thresholdTrace(c)}</p>
                              <p className="audit-trace-line">
                                Accepted by a majority of 5 independent GenLayer
                                validators - this case could not have reached ACCEPTED
                                otherwise.
                              </p>
                            </div>
                            <div>
                              <div className="audit-detail-label">Record</div>
                              <div className="audit-detail-meta">
                                <div translate="no">
                                  submitter {formatAddress(c.submitter)}
                                </div>
                                <div>case #{c.case_id}</div>
                                <div>{formatTimestamp(c.timestamp)}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
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
