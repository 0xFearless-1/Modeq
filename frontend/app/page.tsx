"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { DecisionBar } from "@/components/DecisionBar";

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    totalCases()
      .then(async (c) => {
        setCount(c);
        const all = await listCases(0, c);
        setCases(all);
      })
      .catch(() => setCount(null));
  }, []);

  const allow = cases.filter((c) => c.decision === "ALLOW").length;
  const flag = cases.filter((c) => c.decision === "FLAG").length;
  const block = cases.filter((c) => c.decision === "BLOCK").length;

  return (
    <>
      <section className="hero" style={{ borderTop: "none" }}>
        <div className="aurora">
          <span />
          <span />
          <span />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="eyebrow"
        >
          <span className="dot dot-live" />
          Live on GenLayer Studio, Asimov &amp; Bradbury
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
        >
          Content moderation
          <br />
          you don&apos;t have to <span>trust</span>.
        </motion.h1>

        <motion.p
          className="lead"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
        >
          Every submission is classified by an LLM running independently on multiple
          GenLayer validators. The model never makes the final call - a small piece of
          deterministic code does, and every verdict lands in a public, on-chain audit
          log.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
        >
          <Link className="btn btn-primary btn-lg btn-shimmer" href="/app">
            Launch app
          </Link>
          <Link className="btn btn-secondary btn-lg" href="/audit">
            View audit log
          </Link>
        </motion.div>
      </section>

      <Reveal>
        <section style={{ paddingTop: 0 }}>
          <div className="stat-strip">
            <div className="stat">
              <div className="value">
                <CountUp value={count} />
              </div>
              <div className="label">cases moderated live</div>
            </div>
            <div className="stat">
              <div className="value">
                <CountUp value={5} duration={1} />
              </div>
              <div className="label">validators per verdict</div>
            </div>
            <div className="stat">
              <div className="value">
                <CountUp value={3} duration={1} />
              </div>
              <div className="label">GenLayer networks</div>
            </div>
            <div className="stat">
              <div className="value allow">0</div>
              <div className="label">central authorities</div>
            </div>
          </div>
          {count !== null && count > 0 && (
            <DecisionBar allow={allow} flag={flag} block={block} />
          )}
        </section>
      </Reveal>

      <section>
        <Reveal>
          <div className="section-head">
            <h2>Why not just call an API?</h2>
            <p>
              Because a single company&apos;s black-box moderation gives you one opinion,
              no receipts, and nothing to audit when it gets something wrong.
            </p>
          </div>
        </Reveal>
        <RevealGroup className="feature-grid" stagger={0.12}>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">◆</div>
              <h3>Multi-validator consensus</h3>
              <p>
                Each submission is classified independently by every validator. A
                verdict only lands on-chain once GenLayer&apos;s equivalence principle
                agrees it held up - no single node&apos;s opinion is enough.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">▣</div>
              <h3>Deterministic guardrails</h3>
              <p>
                The model returns structured categories and a confidence score -
                nothing more. Plain, auditable Python code turns that into ALLOW / FLAG
                / BLOCK, so a clever prompt can&apos;t talk its way past the threshold.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">▤</div>
              <h3>Public audit trail</h3>
              <p>
                Every case, every category, every verdict is stored on-chain and
                publicly listable. A community can point to a record instead of asking
                people to trust it.
              </p>
            </div>
          </RevealItem>
        </RevealGroup>
      </section>

      <section>
        <Reveal>
          <div className="section-head">
            <h2>How it works</h2>
            <p>From submission to a recorded, on-chain verdict.</p>
          </div>
        </Reveal>
        <RevealGroup className="steps" stagger={0.12}>
          <RevealItem>
            <div className="step">
              <h3>Submit content</h3>
              <p>Text is sent to the Modeq Intelligent Contract on GenLayer.</p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="step">
              <h3>Independent classification</h3>
              <p>
                Each validator runs the classifier itself; consensus checks the
                results agree before anything is accepted.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="step">
              <h3>Deterministic verdict</h3>
              <p>
                Fixed thresholds turn the classification into ALLOW / FLAG / BLOCK and
                write the case to the public log.
              </p>
            </div>
          </RevealItem>
        </RevealGroup>
      </section>

      <Reveal>
        <section>
          <div className="cta-band">
            <h2>Try it on a real GenLayer network</h2>
            <p>Connect a wallet, submit some text, watch consensus decide.</p>
            <Link className="btn btn-primary btn-lg btn-shimmer" href="/app">
              Launch app
            </Link>
          </div>
        </section>
      </Reveal>

      <footer>
        <span>Modeq - built on GenLayer Intelligent Contracts</span>
        <Link href="/audit">Audit log</Link>
      </footer>
    </>
  );
}
