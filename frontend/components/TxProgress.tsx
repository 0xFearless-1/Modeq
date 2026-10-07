"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowUpRight } from "lucide-react";
import {
  describeStatus,
  explorerTxUrl,
  failedStep,
  shortHash,
  type TxState,
  type TxVotes,
} from "@/lib/tx";

type StepState = "pending" | "active" | "done" | "failed";

function stepStates(tx: TxState): StepState[] {
  const states: StepState[] = ["pending", "pending", "pending", "pending"];

  if (tx.phase === "failed" && tx.failure) {
    const failed = failedStep(tx.failure);
    for (let i = 0; i < failed; i += 1) states[i] = "done";
    if (failed >= 2 && tx.hash) states[1] = "done";
    states[failed] = "failed";
    return states;
  }

  const active =
    tx.phase === "network" || tx.phase === "signing"
      ? 0
      : tx.phase === "consensus"
        ? 2
        : tx.phase === "accepted"
          ? 3
          : 4;

  for (let i = 0; i < 4; i += 1) {
    states[i] = i < active ? "done" : i === active ? "active" : "pending";
  }
  return states;
}

function failureDetail(tx: TxState): string {
  const kind = tx.failure?.kind;
  if (kind === "execution") return "Accepted, but the contract rejected the submission";
  if (kind === "timeout") return "Still waiting after several minutes";
  if (kind === "failed") return describeStatus(tx.status);
  return "Stopped before consensus";
}

function VoteDots({ votes }: { votes: TxVotes }) {
  const slots = Array.from({ length: votes.total }, (_, i) =>
    i < votes.agree ? "agree" : i < votes.agree + votes.disagree ? "disagree" : "waiting",
  );

  return (
    <span className="tx-dots" aria-hidden="true">
      {slots.map((kind, i) => (
        <i key={i} className={`tx-dot ${kind}`} />
      ))}
    </span>
  );
}

function useElapsed(running: boolean): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    setSeconds(0);
    const id = setInterval(
      () => setSeconds(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, [running]);

  return seconds;
}

export function TxProgress({ tx, caseId }: { tx: TxState; caseId: number | null }) {
  const states = stepStates(tx);
  const elapsed = useElapsed(tx.phase === "consensus");
  const votes = tx.votes;

  const walletDetail =
    tx.phase === "network"
      ? "Switching your wallet to GenLayer Studio…"
      : tx.phase === "signing"
        ? "Waiting for your signature…"
        : states[0] === "failed"
          ? "Nothing was sent"
          : "Signed";

  const consensusDetail =
    states[2] === "done"
      ? votes
        ? `Accepted by a majority: ${votes.agree} of ${votes.total} validators agreed`
        : "Accepted by the validators"
      : states[2] === "failed"
        ? failureDetail(tx)
        : states[2] === "active"
          ? `${describeStatus(tx.status)}${votes && votes.cast > 0 ? ` - ${votes.cast} of ${votes.total} votes in` : ""} - ${elapsed}s`
          : "Validators vote on the classification";

  const recordedDetail =
    states[3] === "done"
      ? caseId === null
        ? "Written to the public audit log"
        : `Case #${caseId} is now in the public audit log`
      : states[3] === "active"
        ? "Reading the case back from the registry…"
        : "The verdict is stored on-chain";

  const announcement =
    tx.phase === "failed" && tx.failure
      ? tx.failure.message
      : tx.phase === "recorded"
        ? recordedDetail
        : tx.phase === "consensus"
          ? describeStatus(tx.status)
          : tx.phase === "accepted"
            ? "Consensus reached, reading the verdict"
            : walletDetail;

  return (
    <motion.div
      className="tx"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      role="group"
      aria-label="Transaction progress"
    >
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <ol className="tx-steps">
        <li className={`tx-step ${states[0]}`}>
          <Marker state={states[0]} index={1} />
          <div className="tx-body">
            <div className="tx-title">Confirm in your wallet</div>
            <div className="tx-detail">{walletDetail}</div>
            {tx.phase === "signing" && (
              <p className="tx-hint">
                Wallet says &ldquo;Fee is not set&rdquo; and Approve is disabled? Open the
                fee settings and enter any small custom fee, for example 1 gwei. Studio is
                a free test network: nothing is charged and no funds are needed.
              </p>
            )}
          </div>
        </li>

        <li className={`tx-step ${states[1]}`}>
          <Marker state={states[1]} index={2} />
          <div className="tx-body">
            <div className="tx-title">Sent to GenLayer</div>
            <div className="tx-detail">
              {tx.hash ? (
                <>
                  <code className="tx-hash" title={tx.hash}>
                    {shortHash(tx.hash)}
                  </code>
                  <a
                    className="tx-link"
                    href={explorerTxUrl(tx.hash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in explorer
                    <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                  </a>
                </>
              ) : (
                "The transaction hash appears here once it is sent"
              )}
            </div>
          </div>
        </li>

        <li className={`tx-step ${states[2]}`}>
          <Marker state={states[2]} index={3} />
          <div className="tx-body">
            <div className="tx-title">Validators reach consensus</div>
            <div className="tx-detail">
              {consensusDetail}
              {votes && votes.total > 0 && states[2] !== "pending" && (
                <VoteDots votes={votes} />
              )}
            </div>
          </div>
        </li>

        <li className={`tx-step ${states[3]}`}>
          <Marker state={states[3]} index={4} />
          <div className="tx-body">
            <div className="tx-title">Verdict recorded on-chain</div>
            <div className="tx-detail">{recordedDetail}</div>
          </div>
        </li>
      </ol>

      {tx.phase === "failed" && tx.failure && (
        <div className="tx-failure" role="alert">
          <p>{tx.failure.message}</p>
          {tx.hash && (
            <a href={explorerTxUrl(tx.hash)} target="_blank" rel="noreferrer">
              Check the transaction in the explorer
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Marker({ state, index }: { state: StepState; index: number }) {
  return (
    <span className="tx-marker" aria-hidden="true">
      {state === "done" && <Check size={14} strokeWidth={2.25} />}
      {state === "failed" && <X size={14} strokeWidth={2.25} />}
      {state === "active" && <i className="tx-pulse" />}
      {state === "pending" && <span>{index}</span>}
    </span>
  );
}
