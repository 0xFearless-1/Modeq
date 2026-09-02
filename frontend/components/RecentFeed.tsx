"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, X } from "lucide-react";
import { listCases, type Case } from "@/lib/contract";
import { Waveform } from "@/components/Waveform";
import { categoryMeta } from "@/lib/categories";

const NODE_ICON = {
  ALLOW: Check,
  FLAG: AlertTriangle,
  BLOCK: X,
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function RecentFeed() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const all = await listCases(0, 100);
        if (!cancelled) setCases(all.slice(-5).reverse());
      } catch {
        if (!cancelled) setCases([]);
      }
    }

    refresh();
    const id = setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="side-feed">
      <div className="side-feed-head">
        <Waveform size={0.85} />
        <span>Newest blocks</span>
        <span className="live-dot" title="Live - refreshes every 15s" />
      </div>
      {cases.length === 0 && <p className="muted">No blocks yet.</p>}
      <div className="mini-chain">
        {cases.map((c, i) => {
          const catMeta = categoryMeta(c.primary_category);
          const NodeIcon = NODE_ICON[c.decision];
          return (
            <motion.div
              key={c.case_id}
              className={`mini-chain-block ${c.decision}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <span className="mini-chain-node">
                <NodeIcon size={11} strokeWidth={2.2} />
              </span>
              <div className="mini-chain-content">
                <span className="mini-chain-label">
                  {c.decision === "BLOCK" ? "removed" : c.decision.toLowerCase()}
                  {c.primary_category !== "none" && ` - ${catMeta.label.toLowerCase()}`}
                </span>
                <p>
                  {c.decision === "BLOCK"
                    ? "hidden from the feed"
                    : truncate(c.text, 56)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
