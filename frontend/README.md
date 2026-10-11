# Modeq frontend

A Next.js 16 app (App Router, React 19) with three routes:

| Route | What it does | Wallet |
|---|---|---|
| `/` | Landing page: live registry numbers, the case for consensus, how a verdict is made | no |
| `/app` | Submit text and see the ALLOW / FLAG / BLOCK verdict once GenLayer consensus finalizes it, with your own wallet or through a shared demo account | optional |
| `/audit` | Public audit log from `list_cases`: filters, per-case threshold trace, deep links | no |
| `/demo` | 77-second narrated walkthrough hosted on the same origin, with chapters, captions and download | no |

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
| `MODEQ_RELAYER_PRIVATE_KEY` | Optional, server only. Private key of a throwaway Studio account that signs demo posts. Put it in `.env.production.local` (gitignored). Without it the "Try without a wallet" button does not appear |

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

## Wallet notes

The network is free: `eth_gasPrice` on Studio returns `0x0`, and a brand-new account with no
balance can submit from a wallet that does not check balances (MetaMask). Some wallets treat
a zero fee as "not set" and disable Approve. In that case enter any small custom fee, for
example 1 gwei. Wallets that also check the balance (Keplr, for one) then report
"Insufficient balance": press **Get free test GEN** on `/app`, which calls Studio's
`sim_fundAccount` for the connected account. The address must be EIP-55 checksummed or
Studio credits nothing silently, so the app checksums it first. The app shows these hints
while it waits for the signature.

## Demo account (no wallet)

A visitor without a wallet can press "Try without a wallet" on `/app`. The server signs the
transaction with a throwaway Studio key and returns the transaction hash, and the browser then
follows that transaction through consensus exactly as it does for a wallet. The verdict is
real: the same contract, the same validators, a case in the public log. Differences worth
knowing:

- The case is recorded with the demo account as its submitter. The audit page labels it.
- `POST /api/try` accepts at most 500 characters, refuses cross-site requests and is rate
  limited: three posts per ten minutes per connection and thirty per hour overall.
- The key controls nothing of value. Studio is a test network and the account only holds
  free test GEN from `sim_fundAccount`.
- Posts are public and permanent, like every other case.

## Reading when Studio is slow

`/audit` and the feed read the contract straight from Studio. When that read fails they fall
back to `GET /api/cases`, a server-side snapshot of the case list that is refreshed every
minute and on demand, and the page says so. The snapshot is only a fallback: live reads stay
the default, so the log can still be checked without trusting this server.

## Transaction lifecycle

`/app` shows every stage of a write instead of a spinner:

1. **Confirm in your wallet**: network switch if needed, then the signature request.
2. **Sent to GenLayer**: the transaction hash with a link to the Studio explorer.
3. **Validators reach consensus**: the live status reported by the chain (queued,
   proposing, committing, accepted), how many validators have voted, and elapsed time.
4. **Verdict recorded on-chain**: the new case is read back and matched to the submitting
   wallet, so concurrent users never see each other's result.

Failures are distinct and carry the transaction hash when there is one: a rejected
signature, no consensus (`UNDETERMINED` or `CANCELED`), a submission the contract rejected
after the validators accepted the transaction, and a timeout. The tracking logic lives in
[lib/tx.ts](lib/tx.ts) and is covered by `npm test`.

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
  tx.ts               transaction tracker: statuses, votes, failure classification
  relay.ts            client side of the demo account
  server/             rate limiter, input checks, case snapshot cache, demo signer
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
