"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { connectMetaMask, formatAddress } from "@/lib/genlayer/wallet";
import { getCase, submitContent, totalCases, type Case } from "@/lib/contract";
import { ValidatorPulse } from "@/components/ValidatorPulse";

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

  return (
    <>
      <div className="app-header">
        <h1>Submit for moderation</h1>
        <p>
          Text is classified by an LLM running independently on multiple GenLayer
          validators, then a fixed set of deterministic rules decides ALLOW, FLAG, or
          BLOCK - never the model itself.
        </p>
      </div>

      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="row" style={{ marginTop: 0 }}>
          {account ? (
            <span className="muted">Connected: {formatAddress(account)}</span>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>
              Connect wallet
            </button>
          )}
        </div>

        <div style={{ marginTop: "1.1rem" }}>
          <textarea
            placeholder="Paste the text to moderate..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!account || busy}
          />
        </div>

        <div className="row">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!account || !text.trim() || busy}
          >
            Submit for moderation
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
          {result && (
            <motion.div
              className="result-card"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <span className={`badge ${result.decision}`}>{result.decision}</span>
              <p className="muted" style={{ marginTop: "0.75rem" }}>
                category: {result.primary_category} - confidence:{" "}
                {(result.confidence_bps / 100).toFixed(0)}%
              </p>
              <p className="result-text">{result.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
