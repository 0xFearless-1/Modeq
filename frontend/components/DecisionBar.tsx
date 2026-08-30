"use client";

import { motion } from "framer-motion";

export function DecisionBar({
  allow,
  flag,
  block,
}: {
  allow: number;
  flag: number;
  block: number;
}) {
  const total = allow + flag + block;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);

  return (
    <div className="decision-bar-wrap">
      <div className="decision-bar">
        <motion.div
          className="decision-seg allow"
          initial={{ width: 0 }}
          animate={{ width: `${pct(allow)}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.div
          className="decision-seg flag"
          initial={{ width: 0 }}
          animate={{ width: `${pct(flag)}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        />
        <motion.div
          className="decision-seg block"
          initial={{ width: 0 }}
          animate={{ width: `${pct(block)}%` }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <div className="decision-legend">
        <span>
          <i className="dot-legend allow" /> Allow {allow}
        </span>
        <span>
          <i className="dot-legend flag" /> Flag {flag}
        </span>
        <span>
          <i className="dot-legend block" /> Block {block}
        </span>
      </div>
    </div>
  );
}
