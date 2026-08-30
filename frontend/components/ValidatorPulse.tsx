"use client";

import { motion } from "framer-motion";

export function ValidatorPulse({ label = "Validators are voting" }: { label?: string }) {
  return (
    <div className="validator-pulse">
      <div className="validator-dots">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            className="validator-dot"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: i * 0.14,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="muted">{label}...</span>
    </div>
  );
}
