"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { Waveform } from "@/components/Waveform";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function RecentFeed() {
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    totalCases()
      .then(async (c) => {
        const all = await listCases(Math.max(0, c - 5), 5);
        setCases(all.reverse());
      })
      .catch(() => setCases([]));
  }, []);

  return (
    <div className="side-feed">
      <div className="side-feed-head">
        <Waveform size={0.85} />
        <span>Recent verdicts</span>
      </div>
      {cases.length === 0 && <p className="muted">No cases yet.</p>}
      {cases.map((c, i) => (
        <motion.div
          key={c.case_id}
          className="side-feed-item"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
        >
          <span className={`badge ${c.decision}`}>{c.decision}</span>
          <p>{truncate(c.text, 64)}</p>
        </motion.div>
      ))}
    </div>
  );
}
