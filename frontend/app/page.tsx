"use client";

import Link from "next/link";
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
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { listCases, totalCases, type Case } from "@/lib/contract";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { DecisionDonut } from "@/components/DecisionDonut";
import { ProductWindow } from "@/components/ProductWindow";
import { LiveTicker } from "@/components/LiveTicker";
import { Waveform } from "@/components/Waveform";
import { HeroWave } from "@/components/HeroWave";
import { ScrollSteps } from "@/components/ScrollSteps";

export const dynamic = "force-dynamic";

const EASE = [0.23, 1, 0.32, 1] as const;

export default function LandingPage() {
  const [count, setCount] = useState<number | null>(null);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const [c, all] = await Promise.all([totalCases(), listCases(0, 100)]);
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
      <section className="hero">
        <HeroWave />
        <div className="hero-grid">
          <div>
            <motion.div
              className="kicker-row"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="eyebrow">
                <Waveform size={0.8} />
                Content moderation registry
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.06, ease: EASE }}
            >
              Someone decided your post had to go. You can&rsquo;t see who, why, or
              check&nbsp;it.
            </motion.h1>

            <motion.p
              className="lead"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.14, ease: EASE }}
            >
              Modeq replaces that with a public registry. Five independent GenLayer
              validators classify every piece of content, fixed thresholds - not a
              model&rsquo;s opinion - decide the outcome, and every case stays on-chain
              and checkable by anyone, forever.
            </motion.p>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22, ease: EASE }}
            >
              <Link className="btn btn-primary btn-lg btn-arrow" href="/app">
                Run a real moderation
                <span className="btn-arrow-icon" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={1.75} />
                </span>
              </Link>
              <Link className="btn btn-secondary btn-lg btn-arrow" href="/audit">
                Open the public log
                <span className="btn-arrow-icon" aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={1.75} />
                </span>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          >
            <ProductWindow cases={cases} />
          </motion.div>
        </div>
      </section>

      {cases.length > 0 && (
        <section style={{ padding: 0 }}>
          <LiveTicker cases={cases} />
        </section>
      )}

      <Reveal>
        <section>
          <div className="bezel">
            <div className="bezel-core dashboard-panel">
              <div className="dstat">
                <div className="label">
                  <Activity size={15} strokeWidth={1.75} aria-hidden="true" />
                  cases moderated live
                </div>
                <div className="value">
                  <CountUp value={count} />
                </div>
              </div>
              <div className="dstat">
                <div className="label">
                  <Users size={15} strokeWidth={1.75} aria-hidden="true" />
                  validators per verdict
                </div>
                <div className="value">
                  <CountUp value={5} duration={1} />
                </div>
              </div>
              <div className="dstat">
                <div className="label">
                  <Globe size={15} strokeWidth={1.75} aria-hidden="true" />
                  GenLayer networks
                </div>
                <div className="value">
                  <CountUp value={3} duration={1} />
                </div>
              </div>
              <div className="dstat">
                <div className="label">
                  <ShieldOff size={15} strokeWidth={1.75} aria-hidden="true" />
                  central authorities
                </div>
                <div className="value allow">0</div>
              </div>
              <div className="dashboard-donut">
                <DecisionDonut allow={allow} flag={flag} block={block} />
                <div className="decision-legend">
                  <span>
                    <i className="dot-legend allow" />
                    {allow}
                  </span>
                  <span>
                    <i className="dot-legend flag" />
                    {flag}
                  </span>
                  <span>
                    <i className="dot-legend block" />
                    {block}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section className="chatgpt-section">
        <div className="chatgpt-intro">
          <Reveal>
            <div className="section-head">
              <span className="eyebrow">Why not an LLM</span>
              <h2>Why not just ask an AI chatbot?</h2>
              <p>
                Any LLM can classify text - that was never the hard part. The hard part is
                trusting the answer when nobody else can check it.
              </p>
            </div>
            <p className="chatgpt-closer">
              Modeq doesn&rsquo;t replace the LLM. It replaces trusting one
              company&rsquo;s LLM with a public, verifiable consensus of them.
            </p>
          </Reveal>
        </div>
        <div className="bezel">
          <RevealGroup className="bezel-core feature-grid" stagger={0.08}>
            <RevealItem>
              <div className="feature-card">
                <div className="feature-icon">
                  <Bot size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div className="feature-copy">
                  <h3>One company, one opinion</h3>
                  <p>
                    Ask an AI chatbot and you get a single private company&rsquo;s private
                    answer. Nobody else can verify it, reproduce it, or check it after the
                    fact.
                  </p>
                </div>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="feature-card">
                <div className="feature-icon">
                  <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div className="feature-copy">
                  <h3>No independent check</h3>
                  <p>
                    Modeq needs 5 separate validators to independently reach the same
                    verdict before anything counts. One manipulated or hallucinating model
                    can&rsquo;t decide alone - it just gets outvoted.
                  </p>
                </div>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="feature-card">
                <div className="feature-icon">
                  <ScrollText size={18} strokeWidth={1.6} aria-hidden="true" />
                </div>
                <div className="feature-copy">
                  <h3>No public record</h3>
                  <p>
                    Ask an AI chatbot and the answer disappears with the chat. Every Modeq
                    verdict is permanent, public, and auditable by anyone - forever.
                  </p>
                </div>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section>
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">The difference</span>
            <h2>Moderation you can point at</h2>
            <p>A dashboard can say anything. A public ledger has to show its work.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="bezel">
            <div className="bezel-core compare">
              <div className="compare-col bad">
                <h3>Black-box moderation</h3>
                <ul>
                  <li>
                    <X
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    One company&rsquo;s model, one opinion, no second vote
                  </li>
                  <li>
                    <X
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Verdicts explained after the fact, if at all
                  </li>
                  <li>
                    <X
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    A cleverly worded prompt can talk the model into anything
                  </li>
                  <li>
                    <X
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    No record a third party can independently check
                  </li>
                </ul>
              </div>
              <div className="compare-col good">
                <h3 translate="no">Modeq</h3>
                <ul>
                  <li>
                    <Check
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    5 validators classify independently before anything is accepted
                  </li>
                  <li>
                    <Check
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Structured categories + confidence, not a free-text verdict
                  </li>
                  <li>
                    <Check
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Fixed thresholds decide - the model only classifies
                  </li>
                  <li>
                    <Check
                      className="compare-mark"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    Every case is public and on-chain, forever
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>From text to verdict</h2>
          </div>
        </Reveal>
        <ScrollSteps />
      </section>

      <Reveal>
        <section>
          <div className="bezel">
            <div className="bezel-core cta-band">
              <div>
                <h2>Try it on a real GenLayer network</h2>
                <p>Connect a wallet, submit some text, watch consensus decide.</p>
              </div>
              <Link className="btn btn-primary btn-lg btn-arrow" href="/app">
                Launch app
                <span className="btn-arrow-icon" aria-hidden="true">
                  <ArrowUpRight size={18} strokeWidth={1.75} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
