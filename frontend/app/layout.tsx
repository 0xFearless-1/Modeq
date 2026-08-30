import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Modeq",
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
        <div className="shell">
          <nav>
            <Link className="brand" href="/">
              Modeq
            </Link>
            <div className="links">
              <Link href="/">Submit</Link>
              <Link href="/audit">Audit log</Link>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
