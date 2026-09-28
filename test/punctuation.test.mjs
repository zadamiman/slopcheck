import test from "node:test";
import assert from "node:assert/strict";
import { checkPunctuation } from "../lib/rules/punctuation.mjs";

test("detects em-dash as error", () => {
  const lines = ["Fast, simple — built for developers."];
  const issues = checkPunctuation(lines);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].id, "PUNCT-EM-DASH");
  assert.equal(issues[0].severity, "error");
});

test("detects spaced double-hyphen", () => {
  const lines = ["Fast, simple -- built for developers."];
  const issues = checkPunctuation(lines);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].id, "PUNCT-DOUBLE-HYPHEN");
});

test("passes regular dashes and commas", () => {
  const lines = ["Fast, simple: built for developers."];
  const issues = checkPunctuation(lines);
  assert.equal(issues.length, 0);
});
