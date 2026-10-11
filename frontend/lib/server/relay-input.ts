export const RELAY_MAX_LEN = 500;

export type RelayInput = { ok: true; text: string } | { ok: false; message: string };

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function validateRelayText(value: unknown): RelayInput {
  if (typeof value !== "string") {
    return { ok: false, message: "The text must be a string." };
  }
  const text = value.trim();
  if (text.length === 0) {
    return { ok: false, message: "Write something to classify first." };
  }
  if (text.length > RELAY_MAX_LEN) {
    return { ok: false, message: `The text is limited to ${RELAY_MAX_LEN} characters.` };
  }
  if (CONTROL.test(text)) {
    return { ok: false, message: "The text contains characters that cannot be sent." };
  }
  return { ok: true, text };
}
