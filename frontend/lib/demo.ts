export const DEMO = {
  src: "/demo/modeq-demo.mp4",
  poster: "/demo/poster.jpg",
  captions: "/demo/modeq-demo.en.vtt",
  duration: 77.22,
  txHash: "0x14399f7f4a1ff4c19da9bd26567ec4ac4430df5a39c21ba1e315907539056574",
  caseId: 23,
};

export type Chapter = { t: number; title: string; text: string };

export const CHAPTERS: Chapter[] = [
  {
    t: 0,
    title: "The problem",
    text: "A removed post, and no way to see who decided or why.",
  },
  {
    t: 8.98,
    title: "How a verdict is decided",
    text: "Five validators classify, a majority agrees, fixed thresholds decide.",
  },
  {
    t: 21.34,
    title: "The public audit log",
    text: "Every decision, no wallet needed, with the rule that fired.",
  },
  {
    t: 33.8,
    title: "Connect and post",
    text: "Connect a wallet, pick an example, post it.",
  },
  {
    t: 42.13,
    title: "Follow the transaction",
    text: "Signature, send, consensus and record, with the real chain status.",
  },
  {
    t: 53.45,
    title: "The verdict",
    text: "Block, for spam, with the confidence and how many validators agreed.",
  },
  {
    t: 63.33,
    title: "On the record",
    text: "The new case in the public log, append-only.",
  },
];

export function clock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function explorerTx(hash: string): string {
  return `https://explorer-studio.genlayer.com/tx/${hash}`;
}
