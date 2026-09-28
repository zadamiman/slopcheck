/**
 * AI Slop Code Comments Rules
 */

const COMMENT_PATTERNS = [
  {
    pattern: /^\s*(\/\/|#|\/\*|\*)\s*(Step \d+:|First,|Next,|Finally,|Initialize variable|Define function|Return response|Set up)/i,
    message: "Obvious AI narration comment. Remove mechanical commentary and keep only non-obvious context.",
    id: "COMMENT-AI-NARRATION",
    severity: "warning"
  },
  {
    pattern: /^\s*(\/\/|#|\/\*|\*)\s*(TODO: Implement logic|TODO: Add error handling|This function does [a-zA-Z\s]+)/i,
    message: "Generic or placeholder comment detected.",
    id: "COMMENT-GENERIC-TODO",
    severity: "info"
  }
];

/**
 * Checks source code lines for AI-slop comments.
 * @param {string[]} lines
 * @returns {Array<{line: number, column: number, message: string, id: string, severity: string, match: string}>}
 */
export function checkCodeComments(lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of COMMENT_PATTERNS) {
      let m;
      if ((m = rule.pattern.exec(line)) !== null) {
        issues.push({
          line: i + 1,
          column: m.index + 1,
          message: rule.message,
          id: rule.id,
          severity: rule.severity,
          match: line.trim()
        });
      }
    }
  }

  return issues;
}
