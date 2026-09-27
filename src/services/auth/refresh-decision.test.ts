import assert from "node:assert/strict";
import test from "node:test";
import { classifyRefreshMiss } from "./refresh-decision";

test("a fresh miss is not reuse", () => {
  assert.equal(classifyRefreshMiss(null, Date.now()), "missing");
});

test("a just-rotated token is inside the grace window", () => {
  const now = Date.now();
  assert.equal(
    classifyRefreshMiss({ revokedAt: new Date(now - 1000), replacedBy: "next" }, now),
    "grace"
  );
});

test("an old revoked token is reuse", () => {
  const now = Date.now();
  assert.equal(
    classifyRefreshMiss({ revokedAt: new Date(now - 60_000), replacedBy: "next" }, now),
    "reuse"
  );
});
