"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Play } from "lucide-react";
import { CHAPTERS, DEMO, clock, explorerTx } from "@/lib/demo";

export function DemoPlayer() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [now, setNow] = useState(0);

  const active = CHAPTERS.reduce(
    (found, chapter, index) => (now >= chapter.t - 0.05 ? index : found),
    0,
  );

  function play() {
    void video.current?.play().catch(() => {});
  }

  function seek(time: number) {
    const el = video.current;
    if (!el) return;
    el.currentTime = time;
    play();
  }

  return (
    <div className="demo-grid">
      <div className="demo-main">
        <div className="bezel">
          <div className="bezel-core demo-stage">
            <video
              ref={video}
              className="demo-video"
              src={DEMO.src}
              poster={DEMO.poster}
              controls
              playsInline
              preload="metadata"
              aria-label="Modeq demo video"
              onPlay={() => setStarted(true)}
              onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
            >
              <track kind="captions" srcLang="en" label="English" src={DEMO.captions} />
            </video>

            {!started && (
              <>
                <span className="demo-badge">{clock(DEMO.duration)} · SOUND ON</span>
                <button
                  type="button"
                  className="demo-play"
                  onClick={play}
                  aria-label="Play the demo"
                >
                  <Play size={30} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="demo-actions">
          <a className="btn btn-secondary btn-sm" href={DEMO.src} download>
            <Download size={15} strokeWidth={1.75} aria-hidden="true" />
            Download the mp4
          </a>
          <Link className="btn btn-primary btn-sm btn-arrow" href="/app">
            Launch app
            <span className="btn-arrow-icon" aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={1.75} />
            </span>
          </Link>
          <Link className="btn btn-secondary btn-sm" href="/audit">
            Open the public log
          </Link>
          <span className="demo-time" aria-live="off">
            {clock(now)} / {clock(DEMO.duration)}
          </span>
        </div>

        <p className="demo-note">
          About this recording: the wallet is a scripted test wallet and the voice is
          synthetic. The transaction is real, case #{DEMO.caseId} on GenLayer Studio:{" "}
          <a href={explorerTx(DEMO.txHash)} target="_blank" rel="noreferrer">
            {DEMO.txHash.slice(0, 10)}...{DEMO.txHash.slice(-6)}
          </a>
          .
        </p>
      </div>

      <aside className="demo-chapters" aria-label="Chapters">
        <div className="demo-chapters-head">
          <span>Chapters</span>
          <span>
            {CHAPTERS.length} · {clock(DEMO.duration)}
          </span>
        </div>
        <ol className="demo-chapter-list">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.t}>
              <button
                type="button"
                className={`demo-chapter ${index === active ? "active" : ""}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => seek(chapter.t)}
              >
                <span className="demo-chapter-time">{clock(Math.round(chapter.t))}</span>
                <span className="demo-chapter-body">
                  <span className="demo-chapter-title">{chapter.title}</span>
                  <span className="demo-chapter-text">{chapter.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
