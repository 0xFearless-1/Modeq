import type { Metadata } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
  style: ["normal", "italic"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Modeq - consensus-verified content moderation",
  description:
    "Transparent, consensus-verified content moderation on GenLayer Intelligent Contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <div className="navbar">
          <div className="navbar-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" />
              Modeq
            </Link>
            <div className="nav-links">
              <Link href="/audit">Audit log</Link>
              <Link className="btn btn-primary" href="/app">
                Launch app
              </Link>
            </div>
          </div>
        </div>
        <div className="shell">{children}</div>
      </body>
    </html>
  );
}
