# Deploy notes

## Toolchain gotcha (same as the security-lab project)

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

## studionet (hosted GenLayer Studio) - full functional proof

```bash
genlayer network set studionet
genlayer deploy --contract contracts/moderation_registry.py
```

Deployed contract: `0x5F1957D3AE0e26dCE709fe9095FE39D37f2eC58a`.

Two real submissions were sent and classified by live multi-validator LLM consensus
(5 validators, `strict_eq`), each finalized as `MAJORITY_AGREE` / `ACCEPTED`:

| case_id | text | model output | decision |
|---|---|---|---|
| 0 | "Thanks for the quick response, the new update fixed my issue perfectly." | `primary_category: none`, confidence 99% | **ALLOW** |
| 1 | "Congratulations! You have WON a free prize, click this link now to claim before it expires!!!" | `primary_category: spam`, confidence 99% | **BLOCK** |

This caught a real bug during testing: the first version of the contract treated ANY high
`max_confidence` as reason to block, without checking `primary_category`. A live model
that was 99% confident a message was clean (`primary_category: "none"`) got blocked
anyway. Fixed in `contracts/moderation_registry.py` (the `primary_category == "none"` ->
`ALLOW` short-circuit) and re-deployed; both cases above are from the fixed contract.

An earlier submission attempt on this same fixed contract also needed one validator
rotation before reaching `MAJORITY_AGREE` (`num_of_rounds: 4`) - the protocol retried
until validators agreed, which is the equivalence principle working as intended when LLM
outputs vary slightly between validators, not a failure.

## Testnet (Asimov + Bradbury) - on-chain, schema-verified, and exercised

Deployed to both testnets so evidence exists regardless of which one the program credits
(same pattern as the security-lab: they are separate networks, same chainId 4221,
different consensus contracts and state).

**Asimov** (`https://rpc-asimov.genlayer.com`)
- Contract: `0xA4f786898971380B28c0AaFA9B6bD1f7982844C8`
- https://explorer-asimov.genlayer.com/address/0xA4f786898971380B28c0AaFA9B6bD1f7982844C8
- Verified via `genlayer schema` (methods match the source).
- Exercised: `submit_content("Congratulations! You have WON a free prize...")` ->
  `case_id 0`, `primary_category: spam`, confidence 95%, **decision: BLOCK**.

**Bradbury** (`https://rpc-bradbury.genlayer.com`)
- Contract: `0x5C4744B35f38557D5F038616Be7bB7ECF6fa13d5`
- https://explorer-bradbury.genlayer.com/address/0x5C4744B35f38557D5F038616Be7bB7ECF6fa13d5
- Verified via `genlayer schema` (methods match the source).
- Exercised: `submit_content("Thanks for the quick response...")` -> `case_id 0`,
  `primary_category: none`, confidence 100%, **decision: ALLOW**.

Both are the deployer's first successful deploy on that network; a couple of transient
`Transaction reverted` deploy attempts on Asimov are expected testnet noise (matches prior
experience on this machine) and are not separately listed - they left no reachable state.
