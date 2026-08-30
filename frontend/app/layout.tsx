import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
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

const SITE_URL = "https://modeq.unitynodes.com";
const TITLE = "Modeq - consensus-verified content moderation";
const DESCRIPTION =
  "Modeq classifies content with an LLM running independently on five GenLayer validators. A deterministic threshold - not the model - decides ALLOW, FLAG, or BLOCK, and every case is written to a public on-chain audit log.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s - Modeq" },
  description: DESCRIPTION,
  keywords: [
    "GenLayer",
    "Intelligent Contracts",
    "content moderation",
    "LLM consensus",
    "blockchain moderation",
    "AI moderation",
    "on-chain audit log",
  ],
  authors: [{ name: "Modeq" }],
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Modeq",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Modeq",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <SiteFooter />
      </body>
    </html>
  );
}
