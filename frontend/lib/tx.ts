export type TxPhase =
  "idle" | "network" | "signing" | "consensus" | "accepted" | "recorded" | "failed";

export type TxErrorKind = "rejected" | "failed" | "execution" | "timeout" | "error";

export type TxVotes = {
  total: number;
  cast: number;
  agree: number;
  disagree: number;
};

export type TxFailure = {
  kind: TxErrorKind;
  message: string;
  at: TxPhase;
};

export type TxState = {
  phase: TxPhase;
  hash: string | null;
  status: string | null;
  votes: TxVotes | null;
  failure: TxFailure | null;
};

export type TxUpdate = Partial<Omit<TxState, "failure">>;

export type TxSnapshot = {
  statusName?: string;
  txExecutionResultName?: string;
  consensus_data?: { votes?: Record<string, string> };
  lastRound?: { validatorVotesName?: string[] };
};

export type TxClient<H> = {
  getTransaction: (args: { hash: H }) => Promise<TxSnapshot>;
};

export type TrackOptions = {
  onUpdate: (update: TxUpdate) => void;
  intervalMs?: number;
  timeoutMs?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
};

export const IDLE_TX: TxState = {
  phase: "idle",
  hash: null,
  status: null,
  votes: null,
  failure: null,
};

const EXPLORER_TX_BASE = "https://explorer-studio.genlayer.com/tx/";

const SUCCESS_STATUSES = new Set(["ACCEPTED", "READY_TO_FINALIZE", "FINALIZED"]);
const TERMINAL_FAILURES = new Set(["UNDETERMINED", "CANCELED"]);

const STATUS_LABELS: Record<string, string> = {
  UNINITIALIZED: "Waiting for the network to pick it up",
  PENDING: "Queued, waiting for a validator set",
  PROPOSING: "Leader is proposing a verdict",
  COMMITTING: "Validators are committing their votes",
  REVEALING: "Validators are revealing their votes",
  ACCEPTED: "Consensus reached",
  READY_TO_FINALIZE: "Consensus reached",
  FINALIZED: "Finalized",
  UNDETERMINED: "No consensus",
  CANCELED: "Canceled",
  LEADER_TIMEOUT: "Leader timed out, rotating to another one",
  VALIDATORS_TIMEOUT: "Validators timed out, retrying",
  APPEAL_COMMITTING: "Appeal round in progress",
  APPEAL_REVEALING: "Appeal round in progress",
};

export class TxError extends Error {
  kind: TxErrorKind;
  hash: string | null;

  constructor(kind: TxErrorKind, message: string, hash: string | null = null) {
    super(message);
    this.name = "TxError";
    this.kind = kind;
    this.hash = hash;
  }
}

export function explorerTxUrl(hash: string): string {
  return `${EXPLORER_TX_BASE}${hash}`;
}

export function shortHash(hash: string): string {
  return hash.length > 18 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
}

export function describeStatus(status: string | null): string {
  if (!status) return "Waiting for the first validator update";
  return STATUS_LABELS[status] ?? status.toLowerCase().replaceAll("_", " ");
}

export function readVotes(tx: TxSnapshot): TxVotes | null {
  const named = tx.lastRound?.validatorVotesName;
  if (named && named.length > 0) {
    return {
      total: named.length,
      cast: named.filter((v) => v !== "NOT_VOTED").length,
      agree: named.filter((v) => v === "AGREE").length,
      disagree: named.filter((v) => v === "DISAGREE").length,
    };
  }

  const votes = tx.consensus_data?.votes;
  if (votes) {
    const values = Object.values(votes).map((v) => String(v).toLowerCase());
    if (values.length === 0) return null;
    return {
      total: values.length,
      cast: values.filter((v) => v !== "idle" && v !== "not_voted").length,
      agree: values.filter((v) => v === "agree").length,
      disagree: values.filter((v) => v === "disagree").length,
    };
  }

  return null;
}

function rejectionCode(err: unknown): unknown {
  let current: any = err;
  for (let depth = 0; current && depth < 4; depth += 1) {
    if (current.code === 4001 || current.code === "ACTION_REJECTED") return 4001;
    current = current.cause;
  }
  return null;
}

export function isUserRejection(err: unknown): boolean {
  if (rejectionCode(err) === 4001) return true;
  const message = String((err as { message?: unknown })?.message ?? "");
  return /user (rejected|denied)|rejected the request|request rejected/i.test(message);
}

export function describeFailure(err: unknown): { kind: TxErrorKind; message: string } {
  if (err instanceof TxError) return { kind: err.kind, message: err.message };

  if (isUserRejection(err)) {
    return {
      kind: "rejected",
      message: "You rejected the request in your wallet. Nothing was sent.",
    };
  }

  const raw = String(
    (err as { shortMessage?: unknown })?.shortMessage ??
      (err as { message?: unknown })?.message ??
      err,
  );
  const firstLine = raw.split("\n")[0].trim();
  return {
    kind: "error",
    message: firstLine.length > 220 ? `${firstLine.slice(0, 217)}...` : firstLine,
  };
}

export function failedStep(failure: TxFailure): number {
  if (failure.at === "network" || failure.at === "signing") return 0;
  if (failure.at === "accepted") return 3;
  return 2;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function trackTransaction<H extends string>(
  client: TxClient<H>,
  hash: H,
  options: TrackOptions,
): Promise<TxSnapshot> {
  const interval = options.intervalMs ?? 2500;
  const timeout = options.timeoutMs ?? 240000;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? defaultSleep;
  const started = now();

  while (true) {
    let tx: TxSnapshot | null = null;
    try {
      tx = await client.getTransaction({ hash });
    } catch {
      tx = null;
    }

    if (tx) {
      const status = tx.statusName ?? null;
      options.onUpdate({ status, votes: readVotes(tx) });

      if (status && TERMINAL_FAILURES.has(status)) {
        throw new TxError(
          "failed",
          status === "UNDETERMINED"
            ? "Validators did not reach consensus, so nothing was written on-chain. This can happen on testnets: submit again."
            : "The transaction was canceled before consensus. Nothing was written on-chain.",
          hash,
        );
      }

      if (status && SUCCESS_STATUSES.has(status)) {
        if (tx.txExecutionResultName === "FINISHED_WITH_ERROR") {
          throw new TxError(
            "execution",
            "The contract rejected this submission because the validators could not produce a valid classification. Nothing was stored. Try again or rephrase the text.",
            hash,
          );
        }
        return tx;
      }
    }

    if (now() - started > timeout) {
      throw new TxError(
        "timeout",
        "Still waiting for consensus after several minutes. The transaction may yet complete: check it in the explorer, then refresh the audit log.",
        hash,
      );
    }

    await sleep(interval);
  }
}
