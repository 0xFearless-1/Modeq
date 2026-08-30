"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const VERDICTS: { label: "ALLOW" | "FLAG" | "BLOCK"; var: string }[] = [
  { label: "ALLOW", var: "--allow" },
  { label: "BLOCK", var: "--block" },
  { label: "ALLOW", var: "--allow" },
  { label: "FLAG", var: "--flag" },
];

const NODE_COUNT = 5;
const RADIUS = 108;
const CENTER = 150;

export function ConsensusOrb() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % VERDICTS.length), 2600);
    return () => clearInterval(id);
  }, []);

  const verdict = VERDICTS[step];

  const nodes = Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      x: CENTER + RADIUS * Math.cos(angle),
      y: CENTER + RADIUS * Math.sin(angle),
    };
  });

  return (
    <svg
      viewBox="0 0 300 300"
      className="consensus-orb"
      role="img"
      aria-label="Validator consensus animation"
    >
      {nodes.map((n, i) => (
        <motion.line
          key={`line-${i}`}
          x1={n.x}
          y1={n.y}
          x2={CENTER}
          y2={CENTER}
          stroke="var(--border-strong)"
          strokeWidth={1}
          strokeDasharray="3 5"
          animate={{ strokeDashoffset: [0, -16] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <circle
        cx={CENTER}
        cy={CENTER}
        r={36}
        fill="var(--bg-card)"
        stroke={`var(${verdict.var})`}
        strokeWidth={1.2}
      />
      <foreignObject x={CENTER - 34} y={CENTER - 34} width={68} height={68}>
        <div className="orb-verdict" style={{ color: `var(${verdict.var})` }}>
          {verdict.label}
        </div>
      </foreignObject>

      {nodes.map((n, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r={7}
          fill="var(--bg-card)"
          stroke="var(--ink)"
          strokeWidth={1}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.22,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${n.x}px ${n.y}px` }}
        />
      ))}
    </svg>
  );
}
