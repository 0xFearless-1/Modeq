"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { totalCases } from "@/lib/contract";

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    totalCases()
      .then(setCount)
      .catch(() => setCount(null));
  }, []);

  return (
    <>
      <section className="hero" style={{ borderTop: "none" }}>
        <div className="eyebrow">
          <span className="dot" />
          Live on GenLayer Studio, Asimov &amp; Bradbury
        </div>
        <h1>
          Content moderation
          <br />
          you don&apos;t have to <span>trust</span>.
        </h1>
        <p className="lead">
          Every submission is classified by an LLM running independently on multiple
          GenLayer validators. The model never makes the final call - a small piece of
          deterministic code does, and every verdict lands in a public, on-chain audit
          log.
        </p>
        <div className="hero-ctas">
          <Link className="btn btn-primary btn-lg" href="/app">
            Launch app
          </Link>
          <Link className="btn btn-secondary btn-lg" href="/audit">
            View audit log
          </Link>
        </div>
      </section>

      <section>
        <div className="stat-strip">
          <div className="stat">
            <div className="value">{count === null ? "-" : count}</div>
            <div className="label">cases moderated live</div>
          </div>
          <div className="stat">
            <div className="value">5</div>
            <div className="label">validators per verdict</div>
          </div>
          <div className="stat">
            <div className="value">3</div>
            <div className="label">GenLayer networks</div>
          </div>
          <div className="stat">
            <div className="value allow">0</div>
            <div className="label">central authorities</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Why not just call an API?</h2>
          <p>
            Because a single company&apos;s black-box moderation gives you one opinion,
            no receipts, and nothing to audit when it gets something wrong.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">◆</div>
            <h3>Multi-validator consensus</h3>
            <p>
              Each submission is classified independently by every validator. A verdict
              only lands on-chain once GenLayer&apos;s equivalence principle agrees it
              held up - no single node&apos;s opinion is enough.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">▣</div>
            <h3>Deterministic guardrails</h3>
            <p>
              The model returns structured categories and a confidence score - nothing
              more. Plain, auditable Python code turns that into ALLOW / FLAG / BLOCK, so
              a clever prompt can&apos;t talk its way past the threshold.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">▤</div>
            <h3>Public audit trail</h3>
            <p>
              Every case, every category, every verdict is stored on-chain and
              publicly listable. A community can point to a record instead of asking
              people to trust it.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>How it works</h2>
          <p>From submission to a recorded, on-chain verdict.</p>
        </div>
        <div className="steps">
          <div className="step">
            <h3>Submit content</h3>
            <p>Text is sent to the Modeq Intelligent Contract on GenLayer.</p>
          </div>
          <div className="step">
            <h3>Independent classification</h3>
            <p>
              Each validator runs the classifier itself; consensus checks the results
              agree before anything is accepted.
            </p>
          </div>
          <div className="step">
            <h3>Deterministic verdict</h3>
            <p>
              Fixed thresholds turn the classification into ALLOW / FLAG / BLOCK and
              write the case to the public log.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="cta-band">
          <h2>Try it on a real GenLayer network</h2>
          <p>Connect a wallet, submit some text, watch consensus decide.</p>
          <Link className="btn btn-primary btn-lg" href="/app">
            Launch app
          </Link>
        </div>
      </section>

      <footer>
        <span>Modeq - built on GenLayer Intelligent Contracts</span>
        <Link href="/audit">Audit log</Link>
      </footer>
    </>
  );
}
