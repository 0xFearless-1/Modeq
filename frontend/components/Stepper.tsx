"use client";

const STEPS = ["Connect wallet", "Paste text", "Get verdict"];

export function Stepper({ current }: { current: number }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => (
        <div key={label} className={`stepper-item ${i <= current ? "done" : ""}`}>
          <span className="stepper-dot">{i + 1}</span>
          <span className="stepper-label">{label}</span>
          {i < STEPS.length - 1 && <span className="stepper-line" />}
        </div>
      ))}
    </div>
  );
}
