# Modeq frontend

A minimal Next.js app with two pages:

- `/` - connect MetaMask, submit text, see the ALLOW/FLAG/BLOCK verdict once GenLayer
  consensus finalizes it.
- `/audit` - the public audit log (`list_cases`), no wallet required.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

Then open http://localhost:3000. `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env` points at the
studionet deployment described in [../deploy/NOTES.md](../deploy/NOTES.md); MetaMask must
be pointed at GenLayer Studio to sign the `submit_content` transaction.
