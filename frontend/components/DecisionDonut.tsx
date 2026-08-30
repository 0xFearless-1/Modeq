"use client";

import { motion } from "framer-motion";

export function DecisionDonut({
  allow,
  flag,
  block,
}: {
  allow: number;
  flag: number;
  block: number;
}) {
  const total = allow + flag + block;
  const segments = [
    { key: "allow", value: allow, color: "var(--allow)" },
    { key: "flag", value: flag, color: "var(--flag)" },
    { key: "block", value: block, color: "var(--block)" },
  ];

  let acc = 0;

  return (
    <svg viewBox="0 0 140 140" className="donut" role="img" aria-label="Decision breakdown">
      <circle cx={70} cy={70} r={54} fill="none" stroke="var(--border)" strokeWidth={14} />
      {segments.map((s, i) => {
        const frac = total === 0 ? 0 : s.value / total;
        const offset = total === 0 ? 0 : acc / total;
        acc += s.value;
        if (frac === 0) return null;
        return (
          <motion.circle
            key={s.key}
            cx={70}
            cy={70}
            r={54}
            fill="none"
            stroke={s.color}
            strokeWidth={14}
            strokeLinecap="butt"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: frac }}
            transition={{ duration: 0.9, delay: 0.15 * i, ease: "easeOut" }}
            style={{ pathOffset: offset, rotate: -90, transformOrigin: "70px 70px" }}
          />
        );
      })}
      <text x="70" y="65" textAnchor="middle" className="donut-total">
        {total}
      </text>
      <text x="70" y="83" textAnchor="middle" className="donut-total-label">
        CASES
      </text>
    </svg>
  );
}
