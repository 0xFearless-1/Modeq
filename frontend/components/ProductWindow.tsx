"use client";

import { motion } from "framer-motion";
import type { Case } from "@/lib/contract";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function ProductWindow({ cases }: { cases: Case[] }) {
  const preview = cases.slice(0, 3);

  return (
    <div className="product-window">
      <div className="product-window-bar">
        <span className="product-window-dot" />
        <span className="product-window-dot" />
        <span className="product-window-dot" />
        <span className="product-window-url">modeq.unitynodes.com/audit</span>
      </div>
      <div className="product-window-body">
        {preview.length === 0 && (
          <div className="pw-skeleton">
            <div className="pw-skeleton-line" style={{ width: "70%" }} />
            <div className="pw-skeleton-line" style={{ width: "45%" }} />
            <div className="pw-skeleton-line" style={{ width: "60%" }} />
          </div>
        )}
        {preview.map((c, i) => (
          <motion.div
            key={c.case_id}
            className={`pw-card ${c.decision}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
          >
            <div className="pw-card-top">
              <span className={`badge ${c.decision}`}>{c.decision}</span>
              <span className="pw-conf">{(c.confidence_bps / 100).toFixed(0)}%</span>
            </div>
            <p>{truncate(c.text, 58)}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
