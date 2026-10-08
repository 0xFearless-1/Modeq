import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DemoPlayer } from "@/components/DemoPlayer";
import { DEMO } from "@/lib/demo";

const SITE_URL = "https://modeq.unitynodes.com";
const DESCRIPTION =
  "A 77-second narrated walkthrough of Modeq on the live app: a post is signed, five GenLayer validators classify it, a majority agrees, fixed thresholds decide BLOCK, and the case lands in a public audit log.";

export const metadata: Metadata = {
  title: "Demo",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/demo` },
};

const STACK = [
  "GenLayer Studio",
  "Intelligent Contract · Python",
  "genlayer-js 1.1.8",
  "Next.js 16.3.6",
  "React 19.2",
];

const DOORS = [
  {
    href: "/audit",
    title: "Read every decision",
    text: "No wallet needed. Filter by verdict and open a case to see the exact rule that fired.",
    external: false,
  },
  {
    href: "/app",
    title: "Post to the feed",
    text: "Connect a wallet, post a message and follow the transaction through consensus. Short on test GEN? There is a button for that.",
    external: false,
  },
  {
    href: "https://github.com/UnityNodes/Modeq/blob/main/contracts/moderation_registry.py",
    title: "Read the contract",
    text: "157 lines of Python: the thresholds, the output validation and the consensus pair. Live on Studio, Asimov and Bradbury.",
    external: true,
  },
];

const videoLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Modeq, in seventy-seven seconds",
  description: DESCRIPTION,
  thumbnailUrl: `${SITE_URL}${DEMO.poster}`,
  contentUrl: `${SITE_URL}${DEMO.src}`,
  uploadDate: "2026-10-08",
  duration: "PT1M17S",
};

export default function DemoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }}
      />

      <section className="demo-hero">
        <span className="eyebrow demo-pill">
          <span className="eyebrow-dot" aria-hidden="true" />
          Live on GenLayer Studio
        </span>
        <h1>
          Modeq, in <span className="nowrap">seventy-seven</span> seconds.
        </h1>
        <p className="lead">
          One real post, start to finish on the production app. A wallet signs it, five
          GenLayer validators classify it, a majority agrees, fixed thresholds in the
          contract decide the verdict, and the case lands in a public log anyone can read.
          Nothing here is a mock-up: the recording is the live site.
        </p>
        <ul className="demo-stack" aria-label="Stack">
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <DemoPlayer />

      <section className="demo-doors">
        <div className="section-head">
          <span className="eyebrow">Next</span>
          <h2>Three doors into the real workspace</h2>
        </div>
        <div className="demo-door-grid">
          {DOORS.map((door) =>
            door.external ? (
              <a
                key={door.href}
                className="demo-door"
                href={door.href}
                target="_blank"
                rel="noreferrer"
              >
                <DoorBody title={door.title} text={door.text} />
              </a>
            ) : (
              <Link key={door.href} className="demo-door" href={door.href}>
                <DoorBody title={door.title} text={door.text} />
              </Link>
            ),
          )}
        </div>
      </section>
    </>
  );
}

function DoorBody({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h3>{title}</h3>
      <p>{text}</p>
      <span className="btn-arrow-icon demo-door-arrow" aria-hidden="true">
        <ArrowUpRight size={16} strokeWidth={1.75} />
      </span>
    </>
  );
}
