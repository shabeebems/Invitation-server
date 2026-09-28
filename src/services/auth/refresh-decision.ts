export const REFRESH_GRACE_MS = 30_000;

export type RefreshMiss = "missing" | "grace" | "reuse";

export function classifyRefreshMiss(
  record: { revokedAt: Date | null; replacedBy?: unknown } | null,
  now: number
): RefreshMiss {
  if (!record?.revokedAt) {
    return "missing";
  }

  const age = now - record.revokedAt.getTime();

  if (record.replacedBy && age >= 0 && age < REFRESH_GRACE_MS) {
    return "grace";
  }

  return "reuse";
}
