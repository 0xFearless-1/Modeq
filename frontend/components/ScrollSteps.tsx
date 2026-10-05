"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type MotionStyle,
} from "framer-motion";

const STEPS = [
  {
    num: "01",
    title: "Submit content",
    body: "Text is sent to the Modeq Intelligent Contract on GenLayer.",
  },
  {
    num: "02",
    title: "Independent classification",
    body: "Each validator runs the classifier itself; consensus checks the results agree before anything is accepted.",
  },
  {
    num: "03",
    title: "Deterministic verdict",
    body: "Fixed thresholds turn the classification into ALLOW / FLAG / BLOCK and write the case to the public log.",
  },
];

export function ScrollSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = v >= 0.97 ? 3 : v >= 0.5 ? 2 : v > 0.02 ? 1 : 0;
    setActive((prev) => (prev === next ? prev : next));
  });

  const shown = reduce ? STEPS.length : active;
  const fillStyle = { "--p": reduce ? 1 : scrollYProgress } as MotionStyle;

  return (
    <div className="flow" ref={ref}>
      <div className="flow-rail" aria-hidden="true">
        <motion.div className="flow-rail-fill" style={fillStyle} />
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.num} className={`step ${i < shown ? "active" : ""}`}>
            <span className="step-num" aria-hidden="true">
              {s.num}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
