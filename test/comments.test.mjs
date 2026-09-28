import test from "node:test";
import assert from "node:assert/strict";
import { checkCodeComments } from "../lib/rules/comments.mjs";

test("detects mechanical step narration in comments", () => {
  const lines = [
    "// Step 1: Validate input",
    "const valid = validate(input);",
    "// Step 2: Process request",
    "const result = process(valid);"
  ];
  const issues = checkCodeComments(lines);
  assert.equal(issues.length, 2);
  assert.equal(issues[0].id, "COMMENT-AI-NARRATION");
});

test("passes high-value technical comments", () => {
  const lines = [
    "// Workaround for Safari 15 flexbox child wrapping bug (WebKit #23891)",
    "const el = document.getElementById('target');"
  ];
  const issues = checkCodeComments(lines);
  assert.equal(issues.length, 0);
});
