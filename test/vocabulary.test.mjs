import test from "node:test";
import assert from "node:assert/strict";
import { checkVocabulary } from "../lib/rules/vocabulary.mjs";

test("detects 'delve' as error", () => {
  const lines = ["Let's delve into this code."];
  const issues = checkVocabulary(lines);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].id, "VOCAB-DELVE");
  assert.equal(issues[0].severity, "error");
});

test("detects buzzwords like 'game-changer' and 'seamless'", () => {
  const lines = ["This revolutionary tool is a seamless game-changer."];
  const issues = checkVocabulary(lines);
  assert.ok(issues.length >= 2);
  const ids = issues.map(i => i.id);
  assert.ok(ids.includes("VOCAB-GAMECHANGER"));
  assert.ok(ids.includes("VOCAB-SEAMLESS"));
});

test("passes clean, specific copy", () => {
  const lines = ["This tool parses markdown files and reports regex rule matches."];
  const issues = checkVocabulary(lines);
  assert.equal(issues.length, 0);
});
