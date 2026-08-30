import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en">
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
