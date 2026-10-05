"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Primary">
        <Link className="brand" href="/" translate="no">
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
          <Link
            href="/audit"
            aria-current={pathname.startsWith("/audit") ? "page" : undefined}
          >
            Audit log
          </Link>
          <Link
            className="btn btn-primary btn-sm btn-arrow"
            href="/app"
            aria-current={pathname.startsWith("/app") ? "page" : undefined}
          >
            Launch app
            <span className="btn-arrow-icon" aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={1.75} />
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
