import test from "node:test";
import assert from "node:assert/strict";
import {
  TxError,
  describeFailure,
  describeStatus,
  failedStep,
  readVotes,
  trackTransaction,
  type TxSnapshot,
  type TxUpdate,
} from "./tx.ts";

const HASH =
  "0x58f2301a89e832e647f733f93777fb541eedd5a202c695bc7ad5465a9e5ebd77" as const;

function scripted(steps: (TxSnapshot | Error)[]) {
  let index = 0;
  let clock = 0;
  return {
    client: {
      getTransaction: async () => {
        const step = steps[Math.min(index, steps.length - 1)];
        index += 1;
        if (step instanceof Error) throw step;
        return step;
      },
    },
    now: () => clock,
    sleep: async (ms: number) => {
      clock += ms;
    },
    polls: () => index,
  };
}

function track(steps: (TxSnapshot | Error)[], timeoutMs = 240000) {
  const harness = scripted(steps);
  const updates: TxUpdate[] = [];
  const promise = trackTransaction(harness.client, HASH, {
    onUpdate: (u) => updates.push(u),
    now: harness.now,
    sleep: harness.sleep,
    timeoutMs,
  });
  return { promise, updates, harness };
}

test("walks the real status sequence and resolves on ACCEPTED", async () => {
  const { promise, updates } = track([
    { statusName: "PENDING" },
    { statusName: "PROPOSING" },
    { statusName: "COMMITTING" },
    { statusName: "REVEALING" },
    { statusName: "ACCEPTED", txExecutionResultName: "FINISHED_WITH_RETURN" },
  ]);
  const tx = await promise;
  assert.equal(tx.statusName, "ACCEPTED");
  assert.deepEqual(
    updates.map((u) => u.status),
    ["PENDING", "PROPOSING", "COMMITTING", "REVEALING", "ACCEPTED"],
  );
});

test("UNDETERMINED is a terminal failure that carries the hash", async () => {
  const { promise } = track([
    { statusName: "PROPOSING" },
    { statusName: "UNDETERMINED" },
  ]);
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof TxError);
    assert.equal(err.kind, "failed");
    assert.equal(err.hash, HASH);
    return true;
  });
});

test("CANCELED is a terminal failure", async () => {
  const { promise } = track([{ statusName: "CANCELED" }]);
  await assert.rejects(
    promise,
    (err: unknown) => err instanceof TxError && err.kind === "failed",
  );
});

test("ACCEPTED with a contract error is reported as an execution failure", async () => {
  const { promise } = track([
    { statusName: "ACCEPTED", txExecutionResultName: "FINISHED_WITH_ERROR" },
  ]);
  await assert.rejects(
    promise,
    (err: unknown) => err instanceof TxError && err.kind === "execution",
  );
});

test("leader and validator timeouts are shown but do not fail the transaction", async () => {
  const { promise, updates } = track([
    { statusName: "PROPOSING" },
    { statusName: "LEADER_TIMEOUT" },
    { statusName: "VALIDATORS_TIMEOUT" },
    { statusName: "ACCEPTED" },
  ]);
  const tx = await promise;
  assert.equal(tx.statusName, "ACCEPTED");
  assert.ok(updates.some((u) => u.status === "LEADER_TIMEOUT"));
});

test("transient RPC errors and a not-yet-indexed hash are retried", async () => {
  const { promise, harness } = track([
    new Error("network down"),
    new Error("transaction not found"),
    { statusName: "PENDING" },
    { statusName: "ACCEPTED" },
  ]);
  const tx = await promise;
  assert.equal(tx.statusName, "ACCEPTED");
  assert.equal(harness.polls(), 4);
});

test("gives up with a timeout error that carries the hash", async () => {
  const { promise } = track([{ statusName: "COMMITTING" }], 10000);
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof TxError);
    assert.equal(err.kind, "timeout");
    assert.equal(err.hash, HASH);
    return true;
  });
});

test("reads votes from the round data and from consensus_data", () => {
  assert.deepEqual(
    readVotes({
      lastRound: {
        validatorVotesName: ["AGREE", "AGREE", "AGREE", "DISAGREE", "NOT_VOTED"],
      },
    }),
    { total: 5, cast: 4, agree: 3, disagree: 1 },
  );
  assert.deepEqual(
    readVotes({ consensus_data: { votes: { a: "agree", b: "agree", c: "disagree" } } }),
    {
      total: 3,
      cast: 3,
      agree: 2,
      disagree: 1,
    },
  );
  assert.deepEqual(
    readVotes({
      consensus_data: {
        votes: { a: "agree", b: "agree", c: "agree", d: "agree", e: "idle" },
      },
    }),
    { total: 5, cast: 4, agree: 4, disagree: 0 },
  );
  assert.equal(readVotes({ consensus_data: { votes: {} } }), null);
  assert.equal(readVotes({}), null);
  assert.equal(readVotes({ lastRound: { validatorVotesName: [] } }), null);
});

test("classifies wallet rejections, including nested provider errors", () => {
  assert.equal(describeFailure({ code: 4001, message: "x" }).kind, "rejected");
  assert.equal(
    describeFailure({ message: "outer", cause: { code: 4001 } }).kind,
    "rejected",
  );
  assert.equal(describeFailure(new Error("User rejected the request.")).kind, "rejected");
});

test("passes TxError through and shortens unknown errors to one line", () => {
  const known = new TxError("timeout", "slow", HASH);
  assert.deepEqual(describeFailure(known), { kind: "timeout", message: "slow" });

  const unknown = describeFailure(new Error(`${"a".repeat(400)}\nstack line`));
  assert.equal(unknown.kind, "error");
  assert.ok(unknown.message.length <= 220);
  assert.ok(!unknown.message.includes("stack line"));
});

test("maps the phase a failure happened in to the step that failed", () => {
  assert.equal(failedStep({ kind: "rejected", message: "", at: "signing" }), 0);
  assert.equal(failedStep({ kind: "error", message: "", at: "network" }), 0);
  assert.equal(failedStep({ kind: "failed", message: "", at: "consensus" }), 2);
  assert.equal(failedStep({ kind: "error", message: "", at: "accepted" }), 3);
});

test("describes known and unknown statuses", () => {
  assert.equal(describeStatus("COMMITTING"), "Validators are committing their votes");
  assert.equal(describeStatus("SOMETHING_NEW"), "something new");
  assert.match(describeStatus(null), /first validator update/);
});
