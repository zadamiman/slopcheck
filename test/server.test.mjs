import test from "node:test";
import assert from "node:assert/strict";
import { startServer, autoFixContent } from "../lib/server.mjs";

test("autoFixContent replaces em-dashes and spaced double-hyphens", () => {
  const input = "Fast — simple -- clean.";
  const { cleanContent, fixedCount } = autoFixContent(input);
  assert.equal(cleanContent, "Fast, simple, clean.");
  assert.equal(fixedCount, 2);
});

test("server starts and responds to /api/lint", async () => {
  const server = await startServer({ port: 8999, openBrowser: false });

  try {
    const res = await fetch("http://localhost:8999/api/lint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Let's delve into this." })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.issues.length >= 1);
    assert.equal(data.issues[0].id, "VOCAB-DELVE");
  } finally {
    server.close();
  }
});
