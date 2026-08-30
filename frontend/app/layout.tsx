import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const display = localFont({
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
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
              <Image
                className="brand-mark"
                src="/logo.svg"
                alt=""
                width={47}
                height={32}
                priority
              />
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
