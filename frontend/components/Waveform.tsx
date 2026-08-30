"use client";

import { motion } from "framer-motion";

const HEIGHTS = [6, 11, 16, 10, 14, 8, 12, 5];

export function Waveform({ size = 1 }: { size?: number }) {
  return (
    <div className="waveform" style={{ transform: `scale(${size})` }}>
      {HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="waveform-bar"
          style={{ height: h }}
          animate={{ scaleY: [1, h > 10 ? 0.5 : 1.6, 1] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.09,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
