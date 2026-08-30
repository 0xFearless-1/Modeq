"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Check,
  X,
  Activity,
  Users,
  Globe,
  ShieldOff,
  Bot,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { DecisionDonut } from "@/components/DecisionDonut";
import { ProductWindow } from "@/components/ProductWindow";
import { LiveTicker } from "@/components/LiveTicker";
import { Waveform } from "@/components/Waveform";
import { HeroWave } from "@/components/HeroWave";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const c = await totalCases();
        const all = await listCases(0, c);
        if (cancelled) return;
        setCount(c);
        setCases(all);
      } catch {
        if (!cancelled) setCount((prev) => prev);
      }
    }

    refresh();
    const id = setInterval(refresh, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const allow = cases.filter((c) => c.decision === "ALLOW").length;
  const flag = cases.filter((c) => c.decision === "FLAG").length;
  const block = cases.filter((c) => c.decision === "BLOCK").length;

  return (
    <>
      <section className="hero" style={{ borderTop: "none" }}>
        <HeroWave />
        <div className="hero-grid">
          <div>
            <motion.div
              className="kicker-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Waveform size={0.8} />
              <span className="kicker">Live on GenLayer</span>
            </motion.div>

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
              Post a comment, a forum reply, a DAO message - five GenLayer validators run
              the same classifier on it independently. If they don&apos;t agree, nothing gets
              written. If they do, fixed threshold logic - not the model - decides ALLOW,
              FLAG, or BLOCK, and the post goes on a public ledger anyone can check.
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

      <section className="chatgpt-section">
        <Reveal>
          <div className="section-head">
            <h2>Why not just ask ChatGPT?</h2>
            <p>
              Any LLM can classify text - that was never the hard part. The hard part is
              trusting the answer when nobody else can check it.
            </p>
          </div>
        </Reveal>
        <RevealGroup className="feature-grid" stagger={0.12}>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">
                <Bot size={18} strokeWidth={1.8} />
              </div>
              <h3>One company, one opinion</h3>
              <p>
                Ask ChatGPT and you get a single private company&apos;s private answer.
                Nobody else can verify it, reproduce it, or check it after the fact.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={18} strokeWidth={1.8} />
              </div>
              <h3>No independent check</h3>
              <p>
                Modeq needs 5 separate validators to independently reach the same
                verdict before anything counts. One manipulated or hallucinating model
                can&apos;t decide alone - it just gets outvoted.
              </p>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="feature-card">
              <div className="feature-icon">
                <ScrollText size={18} strokeWidth={1.8} />
              </div>
              <h3>No public record</h3>
              <p>
                Ask ChatGPT and the answer disappears with the chat. Every Modeq verdict
                is permanent, public, and auditable by anyone - forever.
              </p>
            </div>
          </RevealItem>
        </RevealGroup>
        <Reveal>
          <p className="chatgpt-closer">
            Modeq doesn&apos;t replace the LLM. It replaces trusting one company&apos;s
            LLM with a public, verifiable consensus of them.
          </p>
        </Reveal>
      </section>

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

      <footer className="site-footer">
        <div>
          <div className="brand">
            <Image src="/logo.svg" alt="" width={47} height={32} className="brand-mark" />
            Modeq
          </div>
          <p className="site-footer-blurb">
            A transparent, consensus-verified content moderation registry built on
            GenLayer Intelligent Contracts.
          </p>
        </div>

        <div>
          <h4>Product</h4>
          <ul>
            <li>
              <Link href="/app">Launch app</Link>
            </li>
            <li>
              <Link href="/audit">Audit log</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Networks</h4>
          <ul>
            <li>GenLayer Studio</li>
            <li>Asimov testnet</li>
            <li>Bradbury testnet</li>
          </ul>
        </div>

        <div className="site-footer-bottom">Built on GenLayer Intelligent Contracts</div>
      </footer>
    </>
  );
}
