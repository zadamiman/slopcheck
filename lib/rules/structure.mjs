/**
 * AI Slop Structural & Rhetorical Tells Rules
 */

const STRUCTURAL_RULES = [
  {
    pattern: /^\s*[-*+]\s+\*\*([A-Za-z0-9\s]+?):?\*\*:?\s+\1\b/gi,
    message: "Redundant inline-header list item: header repeats the start of the text.",
    id: "STRUCT-REDUNDANT-HEADER",
    severity: "warning"
  },
  {
    pattern: /\b(from first [a-z]+ to final [a-z]+,? and everything in between)\b/gi,
    message: "False range formula ('from X to Y, and everything in between'). Specify concrete actions.",
    id: "STRUCT-FALSE-RANGE",
    severity: "warning"
  },
  {
    pattern: /\b(it's not just [^,\n]+,\s*it's [^.\n]+)\b/gi,
    message: "Negative parallelism formula ('it's not just X, it's Y'). State what it is directly.",
    id: "STRUCT-NEGATIVE-PARALLELISM",
    severity: "warning"
  },
  {
    pattern: /\b(the future looks bright|exciting times lie ahead|embark on this journey)\b/gi,
    message: "Generic upbeat conclusion padding without content.",
    id: "STRUCT-GENERIC-CONCLUSION",
    severity: "warning"
  },
  {
    pattern: /\b(99\.9% uptime|10k\+ users|500m\+ requests|trusted by thousands)\b/gi,
    message: "Potential unverified or placeholder statistic. Ensure numbers are real and sourced.",
    id: "STRUCT-UNVERIFIED-STATS",
    severity: "warning"
  }
];

/**
 * Checks text lines for structural AI slop tells.
 * @param {string[]} lines
 * @returns {Array<{line: number, column: number, message: string, id: string, severity: string, match: string}>}
 */
export function checkStructure(lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of STRUCTURAL_RULES) {
      if (rule.pattern.global) {
        rule.pattern.lastIndex = 0;
        let m;
        while ((m = rule.pattern.exec(line)) !== null) {
          issues.push({
            line: i + 1,
            column: m.index + 1,
            message: rule.message,
            id: rule.id,
            severity: rule.severity,
            match: m[0]
          });
        }
      } else {
        const m = rule.pattern.exec(line);
        if (m) {
          issues.push({
            line: i + 1,
            column: m.index + 1,
            message: rule.message,
            id: rule.id,
            severity: rule.severity,
            match: m[0]
          });
        }
      }
    }
  }

  return issues;
}
