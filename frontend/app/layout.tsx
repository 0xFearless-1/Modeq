import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const FONTSHARE_CSS =
  "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap";

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
    <html lang="en" className={`${body.variable} ${mono.variable}`}>
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link rel="stylesheet" href={FONTSHARE_CSS} />
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
