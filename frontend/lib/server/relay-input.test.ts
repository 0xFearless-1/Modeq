import test from "node:test";
import assert from "node:assert/strict";
import { RELAY_MAX_LEN, validateRelayText } from "./relay-input.ts";

test("accepts ordinary text and trims it", () => {
  assert.deepEqual(validateRelayText("  Great work, team!  "), {
    ok: true,
    text: "Great work, team!",
  });
});

test("keeps line breaks and tabs", () => {
  const result = validateRelayText("line one\nline two\tend");
  assert.equal(result.ok, true);
});

test("rejects non-strings", () => {
  for (const value of [undefined, null, 12, {}, ["x"]]) {
    assert.equal(validateRelayText(value).ok, false);
  }
});

test("rejects empty and whitespace-only text", () => {
  assert.equal(validateRelayText("").ok, false);
  assert.equal(validateRelayText("   \n  ").ok, false);
});

test("enforces the length limit after trimming", () => {
  assert.equal(validateRelayText("a".repeat(RELAY_MAX_LEN)).ok, true);
  assert.equal(validateRelayText(`  ${"a".repeat(RELAY_MAX_LEN)}  `).ok, true);
  assert.equal(validateRelayText("a".repeat(RELAY_MAX_LEN + 1)).ok, false);
});

test("rejects control characters", () => {
  assert.equal(validateRelayText("bad\u0000text").ok, false);
  assert.equal(validateRelayText("bad\u001Btext").ok, false);
});
