/**
 * Reporter for formatting lint results
 */

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

/**
 * Formats results as rich CLI text.
 * @param {Array<{file: string, issues: Array<any>}>} results
 * @returns {string}
 */
export function formatPretty(results) {
  let output = "\n";
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalInfo = 0;

  for (const { file, issues } of results) {
    if (issues.length === 0) continue;

    output += `${ANSI.bold}${file}${ANSI.reset}\n`;

    for (const issue of issues) {
      let badge = `${ANSI.cyan}info${ANSI.reset}`;
      if (issue.severity === "error") {
        badge = `${ANSI.red}${ANSI.bold}error${ANSI.reset}`;
        totalErrors++;
      } else if (issue.severity === "warning") {
        badge = `${ANSI.yellow}warning${ANSI.reset}`;
        totalWarnings++;
      } else {
        totalInfo++;
      }

      const location = `${ANSI.gray}${issue.line}:${issue.column}${ANSI.reset}`.padEnd(14);
      output += `  ${location} ${badge.padEnd(16)} ${issue.message} ${ANSI.gray}(${issue.id})${ANSI.reset}\n`;
    }
    output += "\n";
  }

  const total = totalErrors + totalWarnings + totalInfo;
  if (total === 0) {
    output += `${ANSI.green}${ANSI.bold}✔ No AI slop detected! Everything clean.${ANSI.reset}\n`;
  } else {
    const summaryParts = [];
    if (totalErrors > 0) summaryParts.push(`${ANSI.red}${totalErrors} error${totalErrors > 1 ? "s" : ""}${ANSI.reset}`);
    if (totalWarnings > 0) summaryParts.push(`${ANSI.yellow}${totalWarnings} warning${totalWarnings > 1 ? "s" : ""}${ANSI.reset}`);
    if (totalInfo > 0) summaryParts.push(`${ANSI.cyan}${totalInfo} info${ANSI.reset}`);

    output += `✖ ${ANSI.bold}${total} issue${total > 1 ? "s" : ""} found${ANSI.reset} (${summaryParts.join(", ")})\n`;
  }

  return output;
}

/**
 * Formats results as JSON.
 * @param {Array<{file: string, issues: Array<any>}>} results
 * @returns {string}
 */
export function formatJson(results) {
  return JSON.stringify(results, null, 2);
}

/**
 * Formats results for GitHub Actions workflow annotations.
 * @param {Array<{file: string, issues: Array<any>}>} results
 * @returns {string}
 */
export function formatGithub(results) {
  let output = "";
  for (const { file, issues } of results) {
    for (const issue of issues) {
      const level = issue.severity === "error" ? "error" : "warning";
      output += `::${level} file=${file},line=${issue.line},col=${issue.column},title=${issue.id}::${issue.message}\n`;
    }
  }
  return output;
}
