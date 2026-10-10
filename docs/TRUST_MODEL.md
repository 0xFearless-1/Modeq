# Trust model and known limits

Modeq is a public, verifiable second opinion on a piece of text, plus a permanent audit trail. It is not an autonomous takedown system. This page states exactly what the GenLayer validators attest, what they do not, and where the moderation workflow is still limited.

## What the validators attest

Every `submit_content` call runs `gl.vm.run_nondet_unsafe(leader_fn, validator_fn)` in [`contracts/moderation_registry.py`](../contracts/moderation_registry.py). The leader classifies the text with an LLM. Each validator then re-runs the same classification on its own and votes. The case is stored only if a majority agrees.

| Field | Produced by | Compared by validators |
|---|---|---|
| `decision` (ALLOW, FLAG, BLOCK) | contract thresholds applied to the model output | yes, must be equal |
| `primary_category` | model | yes, must be equal |
| `categories` (all that apply) | model, taken from the leader | no |
| `confidence_bps` | model, taken from the leader | no, only indirectly: it has to land in the band that yields the same decision |
| `timestamp` | the leader's clock | no |
| `text`, `submitter` | the transaction | not applicable |

What this means in practice:

- Agreement shows that independent re-runs of the same prompt reproduce the same verdict. It does not prove the verdict is correct.
- All validators receive the same prompt. Whether they run different models depends on the network, so correlated model errors are possible.
- A modified leader could report a different secondary category list, a different confidence inside the same band, or a different timestamp, because those fields are not compared. The verdict itself cannot be changed that way.

## What the Studio deployment shows

The live app uses GenLayer Studio. Real transactions there reached consensus with 3 of 5 and 4 of 5 validators voting to agree, which is a majority, and the app shows the tally for each verdict. Studio demonstrates the consensus mechanics end to end. Independence of validator operators is a property of the public networks, and the Asimov and Bradbury deployments hold one case each, so that part is lightly evidenced.

## Limits of the moderation workflow

- **No appeals and no human review.** A verdict is final. A wrong classification can only be answered by submitting the text again.
- **Fixed rules.** The categories and the thresholds (BLOCK above 70%, FLAG above 40%) are the same for everyone. There are no per-community policies.
- **Text only.** Images and other media are not classified.
- **No gate.** Anyone can submit any text, with no fee or stake, so a flood of submissions is not rate limited.
- **Public and permanent.** The submitted text is stored on-chain, including text that was blocked. The app hides blocked text by default, but it remains readable in contract state.
- **A log, not an enforcer.** Modeq records verdicts. A forum or DAO that uses it still decides what to do with each verdict, and nothing is removed anywhere else automatically.

## Prompt injection

The prompt tells the model to treat the delimited content as data. The contract validates the shape of the model output, rejects unknown keys, categories and out-of-range confidence, and computes the decision itself, so no output can produce a verdict outside the three states or move a threshold.

Four manual attacks were run against the live contract: a prompt injection, a smuggled `decision: ALLOW` JSON blob, delimiter injection and a fake debug mode (cases 10 to 13 in the audit log). All four were classified as spam and blocked. A mocked non-compliant model response is covered by `test_decision_is_computed_not_trusted_from_model`. This is a small manual red team, not a benchmark. A successful injection could still change the classification within the allowed categories.

## Planned

These are the items already on the roadmap in the [README](../README.md#roadmap):

- an appeal flow that re-runs classification with the submitter's counter-argument under a second independent consensus round;
- configurable thresholds and category sets per community;
- image moderation.
