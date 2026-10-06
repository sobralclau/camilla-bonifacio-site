const allowedLifecycle = new Set(["waiting", "attended", "qualified", "closed"]);
const allowedOutcome = new Set(["open", "won", "lost"]);

export function normalizeLifecycle(value) {
  const v = String(value || "");
  return allowedLifecycle.has(v) ? v : "waiting";
}

export function normalizeOutcome(value) {
  const v = String(value || "");
  return allowedOutcome.has(v) ? v : "open";
}

export function canCloseAsLost({ outcome, lossReason }) {
  if (normalizeOutcome(outcome) !== "lost") return true;
  return String(lossReason || "").trim().length > 0;
}

export function canCloseAsWon({ outcome, dealValueCents }) {
  if (normalizeOutcome(outcome) !== "won") return true;
  return Number(dealValueCents) > 0;
}
