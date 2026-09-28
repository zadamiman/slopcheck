import fs from "node:fs";
import path from "node:path";
import { checkVocabulary } from "./rules/vocabulary.mjs";
import { checkPunctuation } from "./rules/punctuation.mjs";
import { checkStructure } from "./rules/structure.mjs";
import { checkCodeComments } from "./rules/comments.mjs";

/**
 * Strips code fences and inline backticks from markdown for clean prose analysis.
 * Preserves line count and character positions.
 * @param {string[]} lines
 * @returns {string[]}
 */
function sanitizeMarkdownLines(lines) {
  const sanitized = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      sanitized.push("");
      continue;
    }

    if (inCodeBlock) {
      sanitized.push("");
      continue;
    }

    // Replace inline backtick code content with equal length spaces to preserve columns
    const cleanLine = line.replace(/`([^`]+)`/g, (match) => " ".repeat(match.length));
    sanitized.push(cleanLine);
  }

  return sanitized;
}

/**
 * Scans raw content string according to file type or ruleset.
 * @param {string} content
 * @param {string} [filename]
 * @returns {Array<any>}
 */
export function lintContent(content, filename = "") {
  const lines = content.split(/\r?\n/);
  const ext = path.extname(filename).toLowerCase();
  const isCode = [".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rs", ".java", ".c", ".cpp"].includes(ext);
  const isMarkdown = [".md", ".markdown", ".mdx"].includes(ext);

  let issues = [];

  if (isCode) {
    // For code files, scan comments & string literals
    issues.push(...checkCodeComments(lines));
    issues.push(...checkVocabulary(lines));
    issues.push(...checkPunctuation(lines));
  } else {
    const linesToScan = isMarkdown ? sanitizeMarkdownLines(lines) : lines;
    issues.push(...checkVocabulary(linesToScan));
    issues.push(...checkPunctuation(linesToScan));
    issues.push(...checkStructure(linesToScan));
  }

  // Sort by line, column
  issues.sort((a, b) => a.line - b.line || a.column - b.column);
  return issues;
}

/**
 * Lints a file on disk.
 * @param {string} filePath
 * @returns {{file: string, issues: Array<any>}}
 */
export function lintFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const issues = lintContent(content, filePath);
  return { file: filePath, issues };
}

/**
 * Recursively resolves files matching globs or target directories.
 * @param {string[]} targets
 * @param {string[]} [ignore]
 * @returns {string[]}
 */
export function resolveFiles(targets, ignore = ["node_modules", ".git", "dist", "build"]) {
  const files = [];

  function walk(currentPath) {
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      const base = path.basename(currentPath);
      if (ignore.includes(base)) return;

      const entries = fs.readdirSync(currentPath);
      for (const entry of entries) {
        walk(path.join(currentPath, entry));
      }
    } else if (stat.isFile()) {
      files.push(currentPath);
    }
  }

  for (const target of targets) {
    if (fs.existsSync(target)) {
      walk(target);
    }
  }

  return files;
}
