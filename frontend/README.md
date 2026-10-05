# Modeq frontend

A Next.js 16 app (App Router, React 19) with three routes:

| Route | What it does | Wallet |
|---|---|---|
| `/` | Landing page: live registry numbers, the case for consensus, how a verdict is made | no |
| `/app` | Connect MetaMask, submit text, see the ALLOW / FLAG / BLOCK verdict once GenLayer consensus finalizes it | yes |
| `/audit` | Public audit log from `list_cases`: filters, per-case threshold trace, deep links | no |

## Run

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | The `ModerationRegistry` address to read and write. The default is the studionet deployment in [../deploy/NOTES.md](../deploy/NOTES.md) |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | GenLayer Studio endpoint |

Other scripts:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run lint       # tsc --noEmit
```

MetaMask has to be on the GenLayer network to sign `submit_content`. The app checks
`eth_chainId` itself and calls `wallet_switchEthereumChain` (adding the network first when
needed) at connect time and again right before every write, because the client library
skips its own chain check for Studio-based chains.

## Structure

```
app/
  page.tsx            landing
  app/page.tsx        moderation tool
  audit/page.tsx      public audit log (filter and open case live in the URL)
  layout.tsx          fonts, floating nav, skip link, motion provider
  globals.css         design tokens and all styles, no CSS framework
components/           SiteNav, Reveal, ScrollSteps, ProductWindow, RecentFeed, ...
lib/
  contract.ts         typed wrapper over the contract methods
  genlayer/           client and wallet helpers, including the network guard
  categories.tsx      category labels and icons
public/               logo, favicon, llms.txt
```

## Design notes

- All colors, radii and easing curves are CSS custom properties in `globals.css`. The
  accent is taken from the logo gradient, so the UI and the brand mark match.
- Main surfaces use a nested "bezel" (outer shell plus inner core).
- Motion is purposeful and gated: easing tokens, `prefers-reduced-motion` honored through
  Framer Motion's `MotionConfig` and CSS, hover effects only on devices that hover.
- Fonts are self-hosted through `next/font`: Instrument Sans and JetBrains Mono.
