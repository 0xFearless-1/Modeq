"use client";

import { useState } from "react";
import { connectMetaMask, formatAddress } from "@/lib/genlayer/wallet";
import { getCase, submitContent, totalCases, type Case } from "@/lib/contract";

export default function SubmitPage() {
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
    <div className="panel">
      <p className="muted">
        Submitted text is classified by an LLM running independently on multiple GenLayer
        validators, then a fixed set of deterministic rules - not the model itself -
        decides ALLOW, FLAG, or BLOCK.
      </p>

      <div className="row">
        {account ? (
          <span className="muted">Connected: {formatAddress(account)}</span>
        ) : (
          <button onClick={handleConnect}>Connect wallet</button>
        )}
      </div>

      <textarea
        placeholder="Paste the text to moderate..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!account || busy}
      />

      <div className="row">
        <button onClick={handleSubmit} disabled={!account || !text.trim() || busy}>
          {busy ? "Submitting to consensus..." : "Submit for moderation"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="panel" style={{ marginTop: "1.5rem" }}>
          <span className={`badge ${result.decision}`}>{result.decision}</span>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            category: {result.primary_category} - confidence:{" "}
            {(result.confidence_bps / 100).toFixed(0)}%
          </p>
          <p>{result.text}</p>
        </div>
      )}
    </div>
  );
}
