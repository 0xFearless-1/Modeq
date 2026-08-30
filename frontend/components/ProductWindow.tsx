"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { Case } from "@/lib/contract";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function ProductWindow({ cases }: { cases: Case[] }) {
  const preview = cases.slice(0, 3);
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 150, damping: 18 });
  const springY = useSpring(my, { stiffness: 150, damping: 18 });
  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);
  const glowX = useTransform(springX, (v) => `${v * 100}%`);
  const glowY = useTransform(springY, (v) => `${v * 100}%`);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className="product-window"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
    >
      <motion.div
        className="pw-glow"
        style={{ left: glowX, top: glowY }}
        aria-hidden="true"
      />
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
    </motion.div>
  );
}
