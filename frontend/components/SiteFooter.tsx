import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <div className="brand">
          <Image src="/logo.svg" alt="" width={47} height={32} className="brand-mark" />
          <span translate="no">Modeq</span>
        </div>
        <p className="site-footer-blurb">
          A transparent, consensus-verified content moderation registry built on GenLayer
          Intelligent Contracts.
        </p>
      </div>

      <div>
        <h2>Product</h2>
        <ul>
          <li>
            <Link href="/app">Launch app</Link>
          </li>
          <li>
            <Link href="/demo">Demo</Link>
          </li>
          <li>
            <Link href="/audit">Audit log</Link>
          </li>
        </ul>
      </div>

      <div>
        <h2>Networks</h2>
        <ul>
          <li>GenLayer Studio</li>
          <li>Asimov testnet</li>
          <li>Bradbury testnet</li>
        </ul>
      </div>

      <div className="site-footer-bottom">Built on GenLayer Intelligent Contracts</div>
    </footer>
  );
}
