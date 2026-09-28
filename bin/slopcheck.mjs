#!/usr/bin/env node
import process from "node:process";
import fs from "node:fs";
import { resolveFiles, lintFile, lintContent } from "../lib/index.mjs";
import { formatPretty, formatJson, formatGithub } from "../lib/reporter.mjs";

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
slopcheck v1.0.0 - Fast, zero-dependency AI slop & tells linter

Usage:
  slopcheck [options] <files/directories...>
  cat doc.md | slopcheck --stdin

Options:
  -f, --format <pretty|json|github>   Output format (default: pretty)
  -w, --warn-only                     Do not exit with code 1 on errors
  -s, --stdin                         Read input from standard input
  -v, --version                       Show version
  -h, --help                          Show help
`);
}

async function main() {
  if (args.includes("-h") || args.includes("--help") || args.length === 0 && process.stdin.isTTY) {
    showHelp();
    process.exit(0);
  }

  if (args.includes("-v") || args.includes("--version")) {
    console.log("1.0.0");
    process.exit(0);
  }

  let format = "pretty";
  const formatIndex = args.findIndex(arg => arg === "-f" || arg === "--format");
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    format = args[formatIndex + 1];
  } else {
    const formatEq = args.find(arg => arg.startsWith("--format="));
    if (formatEq) format = formatEq.split("=")[1];
  }

  const warnOnly = args.includes("-w") || args.includes("--warn-only");
  const useStdin = args.includes("-s") || args.includes("--stdin") || !process.stdin.isTTY;

  let results = [];

  if (useStdin && (!args.some(a => !a.startsWith("-")) || args.includes("-s") || args.includes("--stdin"))) {
    let input = "";
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    const issues = lintContent(input, "stdin");
    results.push({ file: "<stdin>", issues });
  } else {
    const targetPaths = args.filter(arg => !arg.startsWith("-"));
    const files = resolveFiles(targetPaths);

    if (files.length === 0) {
      console.error("slopcheck: No valid files found.");
      process.exit(1);
    }

    for (const file of files) {
      results.push(lintFile(file));
    }
  }

  if (format === "json") {
    console.log(formatJson(results));
  } else if (format === "github") {
    process.stdout.write(formatGithub(results));
  } else {
    console.log(formatPretty(results));
  }

  const hasErrors = results.some(r => r.issues.some(i => i.severity === "error"));
  if (hasErrors && !warnOnly) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error("slopcheck error:", err);
  process.exit(1);
});
