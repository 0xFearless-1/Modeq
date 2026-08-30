"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Megaphone,
  MessageSquareWarning,
  UserX,
  EyeOff,
  Flame,
} from "lucide-react";
import { connectMetaMask, formatAddress } from "@/lib/genlayer/wallet";
import { getCase, submitContent, totalCases, type Case } from "@/lib/contract";
import { ValidatorPulse } from "@/components/ValidatorPulse";
import { Stepper } from "@/components/Stepper";
import { RecentFeed } from "@/components/RecentFeed";

export const dynamic = "force-dynamic";

const RESULT_ICON = {
  ALLOW: CheckCircle2,
  FLAG: AlertTriangle,
  BLOCK: XCircle,
};

const CRITERIA = [
  { icon: Megaphone, label: "Spam", desc: "ads, scams, promotional links" },
  { icon: MessageSquareWarning, label: "Hate speech", desc: "attacks on identity or group" },
  { icon: UserX, label: "Harassment", desc: "targeted abuse or threats" },
  { icon: EyeOff, label: "NSFW", desc: "sexual or explicit content" },
  { icon: Flame, label: "Violence", desc: "graphic or violent content" },
];

const RESULT_MEANING = {
  ALLOW: "Your post stays visible in the community feed, right away.",
  FLAG: "Your post stays visible, but is marked for review in the community feed.",
  BLOCK: "Your post is hidden from the community feed. The decision itself is still public - anyone can audit it.",
};

const MAX_LEN = 500;

const EXAMPLES = [
  {
    label: "Forum comment",
    text: "Just switched to the new release and it's noticeably faster, great work team!",
  },
  {
    label: "DAO chat message",
    text: "Voted yes on prop #42, the treasury numbers finally add up.",
  },
  {
    label: "Suspicious post",
    text: "Congratulations! You've been selected for a free reward, click here to claim now!!!",
  },
];

export default function AppPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Case | null>(null);

  async function handleConnect() {
    setError(null);
    try {
      const address = await connectMetaMask();
      setAccount(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSubmit() {
    if (!account || !text.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      await submitContent(account, text.trim());
      const count = await totalCases();
      const latest = await getCase(count - 1);
      setResult(latest);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const ResultIcon = result ? RESULT_ICON[result.decision] : null;
  const step = !account ? 0 : busy || result ? 2 : 1;

  return (
    <>
      <div className="app-header">
        <h1>Post to the community feed</h1>
        <p>
          Write a forum comment, a DAO chat message, a support reply - anything a
          community would post. It's classified by an LLM running independently on
          multiple GenLayer validators, then a fixed set of deterministic rules decides
          ALLOW, FLAG, or BLOCK - never the model itself.
        </p>
      </div>

      <div className="criteria-panel">
        <span className="criteria-title">Checked against 5 categories:</span>
        <div className="criteria-grid">
          {CRITERIA.map((c) => (
            <div key={c.label} className="criteria-item">
              <c.icon size={15} strokeWidth={1.8} />
              <div>
                <div className="criteria-label">{c.label}</div>
                <div className="criteria-desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="criteria-note">
          A post that matches none of these is classified <code>none</code> and
          allowed. Each category gets a confidence score - above 70% blocks the post,
          above 40% flags it for review, otherwise it's allowed.
        </p>
      </div>

      <div className="app-layout">
        <div>
          <Stepper current={step} />

          <motion.div
            className="panel"
            style={{ marginTop: 0 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="row" style={{ marginTop: 0 }}>
              {account ? (
                <span className="wallet-chip">
                  <Wallet size={14} strokeWidth={1.8} />
                  {formatAddress(account)}
                </span>
              ) : (
                <button className="btn btn-primary" onClick={handleConnect}>
                  <Wallet size={15} strokeWidth={2} />
                  Connect wallet
                </button>
              )}
            </div>

            <div className="example-row">
              <span className="example-label">Try:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  className="example-chip"
                  onClick={() => setText(ex.text)}
                  disabled={!account || busy}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <textarea
                placeholder="Write a forum comment, a DAO chat message, a support reply..."
                value={text}
                maxLength={MAX_LEN}
                onChange={(e) => setText(e.target.value)}
                disabled={!account || busy}
              />
              <div className="char-count">
                {text.length}/{MAX_LEN}
              </div>
            </div>

            <div className="row">
              <button
                className="btn btn-accent"
                onClick={handleSubmit}
                disabled={!account || !text.trim() || busy}
              >
                <Send size={15} strokeWidth={2} />
                Post to feed
              </button>
              <AnimatePresence>
                {busy && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <ValidatorPulse />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.p
                className="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <AnimatePresence>
              {result && ResultIcon && (
                <motion.div
                  className={`result-card ${result.decision}`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <div className="result-head">
                    <span className="result-icon-wrap">
                      {result.decision === "ALLOW" && (
                        <motion.span
                          className="icon-ping"
                          initial={{ scale: 0.6, opacity: 0.55 }}
                          animate={{ scale: 2.4, opacity: 0 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      )}
                      <ResultIcon
                        size={18}
                        strokeWidth={2}
                        color={`var(--${result.decision.toLowerCase()})`}
                      />
                    </span>
                    <span className={`badge ${result.decision}`}>{result.decision}</span>
                    <span className="muted">
                      {result.primary_category} -{" "}
                      {(result.confidence_bps / 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="result-text">{result.text}</p>
                  <p className="result-meaning">{RESULT_MEANING[result.decision]}</p>
                  <Link href="/audit" className="result-feed-link">
                    See it in the community feed →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <RecentFeed />
      </div>
    </>
  );
}
