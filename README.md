# Modeq

A transparent, consensus-verified content moderation registry built on **GenLayer
Intelligent Contracts**.

> **Status:** MVP live on studionet and both GenLayer testnets (Asimov, Bradbury). Text
> moderation only for now - see [Roadmap](#roadmap).
>
> **Live demo:** [modeq.unitynodes.com](https://modeq.unitynodes.com)

## Why this exists

Content moderation today is almost always a single company's black box: one backend, one
model, one unaccountable decision, no visible trail. Modeq moves the decision itself onto
GenLayer:

- Every submission is classified by an LLM running independently on **multiple
  validators**, and the result only lands on-chain if it survives GenLayer's
  equivalence-principle consensus (a custom `run_nondet_unsafe` validator that reruns the
  classification and compares the decision-relevant fields, not a byte-exact match) - no
  single node's opinion is enough.
- The model is **not trusted with the final call**. It only returns a structured
  classification (categories + confidence); a small piece of deterministic Python code
  in the contract turns that into ALLOW / FLAG / BLOCK. A model can misclassify content,
  but it cannot talk its way past the threshold logic with a clever free-text answer.
- Every case and verdict is stored on-chain and publicly listable
  (`list_cases`/`get_case`) - a small forum, DAO, or community can point to an
  append-only, third-party-auditable moderation log instead of "trust us."

## Contract - `contracts/moderation_registry.py`

```
submit_content(text) -> case_id      # classify + store a new case
get_case(case_id) -> dict            # one case: text, categories, confidence, decision, timestamp
list_cases(offset, limit) -> list    # paginated audit log
total_cases() -> int
```

`submit_content` asks the model for strict JSON
(`{"categories": [...], "primary_category": ..., "max_confidence": "0.xx"}`) against a
fixed category allow-list, validates the shape and values in Python (raises on anything
malformed or out of range), then computes the decision deterministically:

- `primary_category == "none"` -> **ALLOW**
- confidence > 70% -> **BLOCK**
- confidence > 40% -> **FLAG**
- otherwise -> **ALLOW**

Runtime pin: `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }`.

## Testing

```bash
python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
genvm-lint check contracts/moderation_registry.py
pytest tests/direct/ -v                      # fast, in-memory, mocked LLM
gltest --network studionet tests/integration/ -v -s   # real consensus on hosted Studio
```

8 Direct-mode tests cover the ALLOW/FLAG/BLOCK thresholds, the `primary_category ==
"none"` override, rejection of malformed/out-of-allow-list model output, and that a model
cannot smuggle its own `"decision"` field past validation. The integration test deploys
to real GenLayer Studio, submits real content, waits for actual multi-validator
consensus, and reads the resulting case back on-chain.

## Deployed instances

Full reproduction steps and live on-chain evidence (including a real bug this caught, and
its fix) are in [deploy/NOTES.md](deploy/NOTES.md).

| Network | Contract | Status |
|---|---|---|
| studionet | `0xBC9b8c99889fe33f7650FA3530387Ee931AbD107` | 1 live classified case |
| Asimov testnet | [`0xF95A5969c79706C7f4274D4e633315bD014C56Eb`](https://explorer-asimov.genlayer.com/address/0xF95A5969c79706C7f4274D4e633315bD014C56Eb) | schema-verified, 1 live case |
| Bradbury testnet | [`0x13bfD75B34d2C106EA472F105811194352c30461`](https://explorer-bradbury.genlayer.com/address/0x13bfD75B34d2C106EA472F105811194352c30461) | schema-verified, 1 live case |

## Frontend - `frontend/`

A Next.js app: a marketing landing page (`/`), the wallet-connected moderation tool
(`/app`), and a public audit-log page (`/audit`) that lists every case with no wallet
required (the actual transparency pitch). See [frontend/README.md](frontend/README.md).

## Roadmap

- **Multimodal moderation** (planned next Milestone): accept an image alongside/instead
  of text, using `gl.nondet.exec_prompt(images=[...])`, and extend the category schema
  accordingly.
- Per-community configurable thresholds and category sets.
- An appeal flow that re-runs classification with the submitter's counter-argument
  attached, under a second independent consensus round.

## Built on

The official GenLayer toolchain: [`genlayer-py`](https://github.com/genlayerlabs/genlayer-py),
[`genlayer-testing-suite`](https://github.com/genlayerlabs/genlayer-testing-suite) (gltest),
[`genvm-linter`](https://github.com/genlayerlabs/genvm-linter),
[`genlayer-js`](https://github.com/genlayerlabs/genlayer-js), and patterns from the
[`genlayer-project-boilerplate`](https://github.com/genlayerlabs/genlayer-project-boilerplate).

## License

MIT - see [LICENSE](LICENSE).
