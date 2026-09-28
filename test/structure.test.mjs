import test from "node:test";
import assert from "node:assert/strict";
import { checkStructure } from "../lib/rules/structure.mjs";

test("detects redundant inline-header lists", () => {
  const lines = ["- **Performance:** Performance is improved significantly."];
  const issues = checkStructure(lines);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].id, "STRUCT-REDUNDANT-HEADER");
});

test("detects false range formula", () => {
  const lines = ["We manage everything from first click to final invoice, and everything in between."];
  const issues = checkStructure(lines);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].id, "STRUCT-FALSE-RANGE");
});

test("passes regular markdown lists and prose", () => {
  const lines = [
    "- Faster database queries with connection pooling.",
    "- Native CLI exit codes for CI environments."
  ];
  const issues = checkStructure(lines);
  assert.equal(issues.length, 0);
});
