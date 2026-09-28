import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const cliPath = path.resolve("bin/slopcheck.mjs");

test("CLI returns 0 on clean file", () => {
  const tmpFile = path.join(os.tmpdir(), "clean-sample.md");
  fs.writeFileSync(tmpFile, "# Sample Document\n\nThis is clean and concise text.\n", "utf8");
  
  try {
    const stdout = execFileSync(process.execPath, [cliPath, tmpFile], { encoding: "utf8" });
    assert.match(stdout, /No AI slop detected/);
  } finally {
    fs.unlinkSync(tmpFile);
  }
});

test("CLI returns non-zero on file with errors", () => {
  const tmpFile = path.join(os.tmpdir(), "slop-sample.md");
  fs.writeFileSync(tmpFile, "# Sample Document\n\nLet's delve into this seamlessly — it is a game-changer.\n", "utf8");

  assert.throws(() => {
    execFileSync(process.execPath, [cliPath, tmpFile], { encoding: "utf8" });
  });

  fs.unlinkSync(tmpFile);
});

test("CLI supports --format=json", () => {
  const tmpFile = path.join(os.tmpdir(), "json-sample.md");
  fs.writeFileSync(tmpFile, "Let's delve into this.", "utf8");

  try {
    assert.throws(() => {
      execFileSync(process.execPath, [cliPath, "--format=json", tmpFile], { encoding: "utf8" });
    });
  } finally {
    fs.unlinkSync(tmpFile);
  }
});
