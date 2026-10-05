import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0e0e10",
  colorScheme: "dark",
};

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
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <SiteNav />
          <main id="main" className="shell">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
