"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, X, Activity, Users, Globe, ShieldOff } from "lucide-react";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { DecisionDonut } from "@/components/DecisionDonut";
import { ProductWindow } from "@/components/ProductWindow";
import { LiveTicker } from "@/components/LiveTicker";

export const dynamic = "force-dynamic";

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
        <div className="hero-grid">
          <div>
            <motion.span
              className="kicker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Live on GenLayer - Studio, Asimov, Bradbury
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06 }}
            >
              No single model decides
              <br />
              what gets <em>moderated</em>.
            </motion.h1>

            <motion.p
              className="lead"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              Five GenLayer validators run the same classifier independently on every
              submission. If they don&apos;t agree, nothing gets written. If they do,
              fixed threshold logic - not the model - decides ALLOW, FLAG, or BLOCK, and
              the case goes on a public ledger anyone can check.
            </motion.p>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
            >
              <Link className="btn btn-primary btn-lg" href="/app">
                Launch app
              </Link>
              <Link className="btn btn-secondary btn-lg" href="/audit">
                View audit log
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <ProductWindow cases={cases} />
          </motion.div>
        </div>
      </section>

      {cases.length > 0 && (
        <section style={{ padding: "0", border: "none" }}>
          <LiveTicker cases={cases} />
        </section>
      )}

      <Reveal>
        <section>
          <div className="dashboard-panel">
            <div className="dstat-grid">
              <div className="dstat">
                <span className="dstat-icon">
                  <Activity size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="value">
                    <CountUp value={count} />
                  </div>
                  <div className="label">cases moderated live</div>
                </div>
              </div>
              <div className="dstat">
                <span className="dstat-icon">
                  <Users size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="value">
                    <CountUp value={5} duration={1} />
                  </div>
                  <div className="label">validators per verdict</div>
                </div>
              </div>
              <div className="dstat">
                <span className="dstat-icon">
                  <Globe size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="value">
                    <CountUp value={3} duration={1} />
                  </div>
                  <div className="label">GenLayer networks</div>
                </div>
              </div>
              <div className="dstat">
                <span className="dstat-icon">
                  <ShieldOff size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <div className="value allow">0</div>
                  <div className="label">central authorities</div>
                </div>
              </div>
            </div>

            <div className="dashboard-donut">
              <DecisionDonut allow={allow} flag={flag} block={block} />
              <div className="decision-legend" style={{ marginTop: 0 }}>
                <span>
                  <i className="dot-legend allow" /> {allow}
                </span>
                <span>
                  <i className="dot-legend flag" /> {flag}
                </span>
                <span>
                  <i className="dot-legend block" /> {block}
                </span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section>
        <Reveal>
          <div className="section-head">
            <h2>Moderation you can point at</h2>
            <p>A dashboard can say anything. A public ledger has to show its work.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="compare">
            <div className="compare-col bad">
              <h3>Black-box moderation</h3>
              <ul>
                <li>
                  <X className="compare-mark" size={16} strokeWidth={2.2} />
                  One company&apos;s model, one opinion, no second vote
                </li>
                <li>
                  <X className="compare-mark" size={16} strokeWidth={2.2} />
                  Verdicts explained after the fact, if at all
                </li>
                <li>
                  <X className="compare-mark" size={16} strokeWidth={2.2} />A
                  cleverly worded prompt can talk the model into anything
                </li>
                <li>
                  <X className="compare-mark" size={16} strokeWidth={2.2} />
                  No record a third party can independently check
                </li>
              </ul>
            </div>
            <div className="compare-col good">
              <h3>Modeq</h3>
              <ul>
                <li>
                  <Check className="compare-mark" size={16} strokeWidth={2.2} />5
                  validators classify independently before anything is accepted
                </li>
                <li>
                  <Check className="compare-mark" size={16} strokeWidth={2.2} />
                  Structured categories + confidence, not a free-text verdict
                </li>
                <li>
                  <Check className="compare-mark" size={16} strokeWidth={2.2} />
                  Fixed thresholds decide - the model only classifies
                </li>
                <li>
                  <Check className="compare-mark" size={16} strokeWidth={2.2} />
                  Every case is public and on-chain, forever
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="section-head">
            <h2>From text to verdict</h2>
          </div>
        </Reveal>
        <div className="flow-line">
          <motion.div
            className="flow-dot"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <RevealGroup className="steps" stagger={0.12}>
          <RevealItem>
            <div className="step">
              <span className="step-num">01</span>
              <h3>Submit content</h3>
              <p>Text is sent to the Modeq Intelligent Contract on GenLayer.</p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="step">
              <span className="step-num">02</span>
              <h3>Independent classification</h3>
              <p>
                Each validator runs the classifier itself; consensus checks the
                results agree before anything is accepted.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="step">
              <span className="step-num">03</span>
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
            <div>
              <h2>Try it on a real GenLayer network</h2>
              <p>Connect a wallet, submit some text, watch consensus decide.</p>
            </div>
            <Link className="btn btn-primary btn-lg" href="/app">
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
