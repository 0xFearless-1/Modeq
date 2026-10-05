"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ShieldCheck } from "lucide-react";
import type { Case } from "@/lib/contract";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function ProductWindow({ cases }: { cases: Case[] }) {
  const preview = cases.slice(0, 3);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const springX = useSpring(mx, { stiffness: 150, damping: 18 });
  const springY = useSpring(my, { stiffness: 150, damping: 18 });
  const rotateX = useTransform(springY, [0, 1], [7, -7]);
  const rotateY = useTransform(springX, [0, 1], [-9, 9]);
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
      className="bezel pw-bezel"
      onMouseMove={reduce ? undefined : handleMove}
      onMouseLeave={reduce ? undefined : handleLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
    >
      <div className="bezel-core product-window">
        <motion.div
          className="pw-glow"
          style={{ left: glowX, top: glowY }}
          aria-hidden="true"
        />
        <div className="product-window-bar">
          <span className="product-window-dot" />
          <span className="product-window-dot" />
          <span className="product-window-dot" />
          <span className="product-window-url">Audit log</span>
          <span className="product-window-live">
            <span className="live-dot" style={{ marginLeft: 0 }} />
            live
          </span>
        </div>
        <div className="product-window-body">
          {preview.length === 0 && (
            <div className="pw-skeleton" aria-hidden="true">
              <div className="pw-skeleton-line" />
              <div className="pw-skeleton-line" style={{ animationDelay: "0.15s" }} />
              <div className="pw-skeleton-line" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
          {preview.map((c, i) => (
            <motion.div
              key={c.case_id}
              className={`pw-card ${c.decision}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.12,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <div className="pw-card-top">
                <span className={`dot-legend ${c.decision.toLowerCase()}`} />
                <span className={`badge ${c.decision}`}>
                  {c.decision === "BLOCK" ? "removed" : c.decision}
                </span>
                <span className="pw-conf">{(c.confidence_bps / 100).toFixed(0)}%</span>
              </div>
              <p>
                {c.decision === "BLOCK" ? "Hidden from the feed" : truncate(c.text, 58)}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="product-window-foot">
          <ShieldCheck size={13} strokeWidth={1.75} aria-hidden="true" />
          Every verdict accepted by a validator majority
        </div>
      </div>
    </motion.div>
  );
}
