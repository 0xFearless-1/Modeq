"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const VERDICTS: { label: "ALLOW" | "FLAG" | "BLOCK"; color: string }[] = [
  { label: "ALLOW", color: "var(--allow)" },
  { label: "BLOCK", color: "var(--block)" },
  { label: "ALLOW", color: "var(--allow)" },
  { label: "FLAG", color: "var(--flag)" },
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
    <svg viewBox="0 0 300 300" className="consensus-orb" role="img" aria-label="Validator consensus animation">
      {nodes.map((n, i) => (
        <motion.line
          key={`line-${i}`}
          x1={n.x}
          y1={n.y}
          x2={CENTER}
          y2={CENTER}
          stroke="var(--accent)"
          strokeWidth={1.4}
          strokeOpacity={0.35}
          strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={40}
        fill="none"
        stroke={verdict.color}
        strokeWidth={1.5}
        strokeOpacity={0.5}
        animate={{ r: [40, 50, 40], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
      />

      <circle cx={CENTER} cy={CENTER} r={34} fill="var(--bg-card)" stroke="var(--border)" />
      <foreignObject x={CENTER - 34} y={CENTER - 34} width={68} height={68}>
        <div className="orb-verdict" style={{ color: verdict.color }}>
          {verdict.label}
        </div>
      </foreignObject>

      {nodes.map((n, i) => (
        <motion.g key={`node-${i}`}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            r={9}
            fill="var(--bg-card)"
            stroke="var(--accent)"
            strokeWidth={1.5}
            animate={{ scale: [1, 1.22, 1] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.22,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          />
        </motion.g>
      ))}
    </svg>
  );
}
