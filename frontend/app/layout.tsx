import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="noise" />
        <div className="navbar">
          <div className="navbar-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" />
              Modeq
            </Link>
            <div className="nav-links">
              <Link href="/audit">Audit log</Link>
              <Link className="btn btn-primary btn-shimmer" href="/app">
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
