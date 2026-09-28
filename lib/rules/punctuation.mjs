/**
 * AI Slop Punctuation & Formatting Rules
 */

/**
 * Checks text lines for em-dashes and improper AI formatting.
 * @param {string[]} lines
 * @returns {Array<{line: number, column: number, message: string, id: string, severity: string, match: string}>}
 */
export function checkPunctuation(lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for em-dash (—) and en-dash (–)
    const emDashRegex = /([—–])/g;
    let match;
    while ((match = emDashRegex.exec(line)) !== null) {
      issues.push({
        line: i + 1,
        column: match.index + 1,
        message: `Em/En dash ('${match[0]}') detected. Replace with comma, period, colon, or parenthesis.`,
        id: "PUNCT-EM-DASH",
        severity: "error",
        match: match[0]
      });
    }

    // Check for spaced double-hyphens (" -- ")
    const doubleHyphenRegex = /\s--\s/g;
    while ((match = doubleHyphenRegex.exec(line)) !== null) {
      issues.push({
        line: i + 1,
        column: match.index + 1,
        message: "Spaced double-hyphen (' -- ') used as dash substitute detected.",
        id: "PUNCT-DOUBLE-HYPHEN",
        severity: "warning",
        match: match[0]
      });
    }

    // Check for excessive scare quotes (e.g. "solution" "streamlines" "workflow")
    const scareQuotes = line.match(/"[a-zA-Z0-9_\-\s]{1,15}"/g);
    if (scareQuotes && scareQuotes.length >= 3) {
      issues.push({
        line: i + 1,
        column: 1,
        message: "Excessive quotation marks/scare quotes detected in a single line.",
        id: "PUNCT-EXCESSIVE-QUOTES",
        severity: "warning",
        match: scareQuotes.join(", ")
      });
    }
  }

  return issues;
}
