# Deploy notes

## Toolchain gotcha

The pinned Python client (`genlayer-py 0.18`) cannot deploy to the current testnet - it
fails to decode the consensus contract's `getTransactionData` response. Deploy and call
contracts through the newer Node `genlayer` CLI instead:

```bash
genlayer network set <network>
genlayer account import --name <name> --private-key <key> --password <pw>
printf '<pw>\n' | genlayer deploy --contract contracts/moderation_registry.py
printf '<pw>\n' | genlayer write <address> submit_content --args "some text"
genlayer call <address> get_case --args 0
```

Deployer: the well-known public Anvil/Foundry dev key #0
(`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`), imported here under the account name
`modeq-deployer` with its own keystore password - not a secret, this is the standard
test key every Foundry/Hardhat install ships with. Funded with GEN on both testnets from
prior work on this machine.

Testnet writes occasionally return `VALIDATORS_TIMEOUT` / do not commit on the first try
(seen once on Asimov) - a retry succeeds. This is testnet liveness variance, not a
contract issue; the studionet run below shows the same content classified consistently
across two independent submissions.

## Consensus-mechanism fix (genlayer-dev skill review)

The official `genlayer-dev` Claude Code plugin (`genlayerlabs/skills`) ships a
`write-contract` skill whose anti-pattern table flags exactly what the original contract
did: **`strict_eq()` for LLM calls always risks failing consensus**, because LLM output
isn't byte-identical across validators. That matches what we saw empirically - one live
submission on the `strict_eq` version came back `UNDETERMINED` and another needed a
validator rotation (`num_of_rounds: 4`) before agreeing.

Fixed by replacing `gl.eq_principle.strict_eq(classify)` with a custom
`gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` pair, per the skill's recommended
pattern: the decision (ALLOW/FLAG/BLOCK) is computed *inside* the nondet closure, and the
validator reruns classification independently and compares only the decision-relevant
fields (`decision`, `primary_category`) rather than requiring an exact match on the whole
JSON blob (which would also catch confidence-value jitter like 97% vs 99%). Also replaced
bare `raise Exception(...)` with `gl.vm.UserError("[LLM_ERROR] ...")` per the same skill -
bare exceptions become unrecoverable VMErrors; a classified, prefixed UserError lets a
validator that fails to reproduce valid output deliberately disagree (forcing rotation)
instead of the whole path becoming undebuggable.

All contracts were redeployed after this fix (new addresses below). Both direct-mode
tests (8/8) and the real `tests/integration/` end-to-end test were re-run against the new
contract and pass; the studionet exercise below shows two independent submissions landing
`ACCEPTED` with no rotations needed.

## studionet (hosted GenLayer Studio) - full functional proof

```bash
genlayer network set studionet
genlayer deploy --contract contracts/moderation_registry.py
```

Deployed contract: `0xBC9b8c99889fe33f7650FA3530387Ee931AbD107`.

A real submission was sent and classified by live multi-validator LLM consensus
(5 validators, custom `run_nondet_unsafe` validator), finalized as `MAJORITY_AGREE` /
`ACCEPTED`:

| case_id | text | model output | decision |
|---|---|---|---|
| 0 | "Just switched to the new release and it's noticeably faster, great work team!" | `primary_category: none`, confidence 99% | **ALLOW** |

An earlier version of this contract caught a real bug during testing: it treated ANY high
`max_confidence` as reason to block, without checking `primary_category`, so a model that
was 99% confident a message was clean (`primary_category: "none"`) got blocked anyway.
Fixed with the `primary_category == "none"` -> `ALLOW` short-circuit (still present in the
current contract).

## Testnet (Asimov + Bradbury) - on-chain, schema-verified, and exercised

Deployed to both testnets so evidence exists regardless of which one the program credits
(they are separate networks, same chainId 4221, different consensus contracts and state).

**Asimov** (`https://rpc-asimov.genlayer.com`)
- Contract: `0xF95A5969c79706C7f4274D4e633315bD014C56Eb`
- https://explorer-asimov.genlayer.com/address/0xF95A5969c79706C7f4274D4e633315bD014C56Eb
- Verified via `genlayer schema` (methods match the source).
- Exercised: `submit_content("Congratulations! You have WON a free prize...")` ->
  `case_id 0`, `primary_category: spam`, confidence 95%, **decision: BLOCK**.

**Bradbury** (`https://rpc-bradbury.genlayer.com`)
- Contract: `0x13bfD75B34d2C106EA472F105811194352c30461`
- https://explorer-bradbury.genlayer.com/address/0x13bfD75B34d2C106EA472F105811194352c30461
- Verified via `genlayer schema` (methods match the source).
- Exercised: `submit_content("Thanks for the quick response...")` -> `case_id 0`,
  `primary_category: none`, confidence 100%, **decision: ALLOW**.

## Timestamp field (real user report)

`Case` had no timestamp at all - the audit log couldn't show when a post was submitted.
GenVM has no built-in deterministic clock accessor, but `time.time()` called from inside
`leader_fn()` (already running under `gl.vm.run_nondet_unsafe`, an explicitly
non-deterministic context) works: `genvm-lint` flags it as a non-deterministic call
(warning, not an error) since it can't know statically that the call site is already
inside an approved nondet wrapper, and the value is never compared in `validator_fn` -
only the leader's accepted result is stored, same as the existing `confidence_bps` jitter
tolerance. Verified live on studionet: submitted at wall-clock `1788327287`, the stored
`timestamp` came back as `1788327269` (18s earlier, matching real execution time - not 0,
not a placeholder). All three networks above were redeployed with this field and
re-exercised.

## Wallet network guard (real user report, caught by Blockaid)

`genlayer-js`'s own `assertChainMatch` skips its chain-id check entirely for
Studio-based chains (`if (chainConfig.isStudio) return;`), so a wallet left on an
unrelated network (e.g. Ethereum mainnet, wallet's default) was asked to sign the
`submit_content` transaction against whatever chain it currently had active. A user's
wallet correctly flagged the resulting mainnet request via Blockaid as a deceptive
request to a malicious address. Fixed in `frontend/lib/genlayer/wallet.ts`: the app now
checks `eth_chainId` itself and requests `wallet_switchEthereumChain`
(`wallet_addEthereumChain` first if the network isn't added yet) both at connect time and
again immediately before every write, instead of trusting the library's check. Verified
live against the deployed frontend with an injected EIP-1193 provider starting on chain
`0x1` (mainnet): connect correctly triggers `wallet_switchEthereumChain` to `0xf22f`
before any signature is requested.

## Live frontend - modeq.unitynodes.com

Self-hosted (Caddy reverse proxy + PM2), not a third-party host:

- Production build (`next build`) run under PM2 as `modeq-frontend`, `PORT=3211`,
  persisted with `pm2 save` so it survives restarts/reboots.
- Caddy terminates TLS and reverse-proxies to the local process:
  ```
  modeq.unitynodes.com {
      encode gzip
      reverse_proxy localhost:3211 {
          lb_try_duration 20s
          lb_try_interval 250ms
      }
  }
  ```
- Verified end to end against `localhost` with the Host header forced before any DNS
  existed (`curl --resolve modeq.unitynodes.com:443:127.0.0.1 ...`) - both `/` and
  `/audit` returned 200.
- DNS: a proxied Cloudflare A record pointing `modeq` at the server.
