/**
 * AI Slop Vocabulary & Buzzwords Rule
 */

const BUZZWORDS = [
  // Abstract empty verbs & nouns
  { pattern: /\bdelve\b/gi, message: "AI vocabulary: 'delve' detected. Use 'explore', 'investigate', or get straight to the point.", id: "VOCAB-DELVE", severity: "error" },
  { pattern: /\btestament to\b/gi, message: "Significance inflation: 'testament to' detected. Provide concrete evidence instead.", id: "VOCAB-TESTAMENT", severity: "warning" },
  { pattern: /\btapestry\b/gi, message: "AI metaphor: 'tapestry' detected. Use plain descriptive nouns.", id: "VOCAB-TAPESTRY", severity: "error" },
  { pattern: /\bpivotal moment\b/gi, message: "Significance inflation: 'pivotal moment' detected.", id: "VOCAB-PIVOTAL", severity: "warning" },
  { pattern: /\bgame-changer\b/gi, message: "Buzzword: 'game-changer' detected. State the specific benefit instead.", id: "VOCAB-GAMECHANGER", severity: "warning" },
  { pattern: /\bseamlessly\b/gi, message: "Buzzword: 'seamlessly' detected.", id: "VOCAB-SEAMLESS", severity: "warning" },
  { pattern: /\bseamless\b/gi, message: "Buzzword: 'seamless' detected.", id: "VOCAB-SEAMLESS", severity: "warning" },
  { pattern: /\bgroundbreaking\b/gi, message: "Buzzword: 'groundbreaking' detected.", id: "VOCAB-GROUNDBREAKING", severity: "warning" },
  { pattern: /\brevolutionize\b/gi, message: "Buzzword: 'revolutionize' detected. State exact improvements.", id: "VOCAB-REVOLUTIONIZE", severity: "warning" },
  { pattern: /\brevolutionizing\b/gi, message: "Buzzword: 'revolutionizing' detected.", id: "VOCAB-REVOLUTIONIZE", severity: "warning" },
  { pattern: /\bcutting-edge\b/gi, message: "Buzzword: 'cutting-edge' detected.", id: "VOCAB-CUTTINGEDGE", severity: "warning" },
  { pattern: /\bnext-level\b/gi, message: "Buzzword: 'next-level' detected.", id: "VOCAB-NEXTLEVEL", severity: "warning" },
  { pattern: /\bempower(s|ing)?\b/gi, message: "Vague buzzword: 'empower' detected. Name the exact capability unlocked.", id: "VOCAB-EMPOWER", severity: "warning" },
  { pattern: /\belevate(s|ing)?\b/gi, message: "Vague buzzword: 'elevate' detected. Explain what is actually upgraded.", id: "VOCAB-ELEVATE", severity: "warning" },
  { pattern: /\bunlock(s|ing)? the (true )?power\b/gi, message: "AI cliché: 'unlock the power' detected.", id: "VOCAB-UNLOCK-POWER", severity: "error" },
  { pattern: /\brobust\b/gi, message: "Generic adjective: 'robust' detected. Specify resilience or architecture details.", id: "VOCAB-ROBUST", severity: "info" },
  
  // Fake intimacy & conversational filler
  { pattern: /\b(let's dive in|dive deep into|without further ado)\b/gi, message: "Signposting announcement: get straight to the content.", id: "VOCAB-SIGNPOSTING", severity: "error" },
  { pattern: /\b(at its core|the heart of the matter|fundamentally speaking)\b/gi, message: "Persuasive authority trope detected.", id: "VOCAB-AUTHORITY-TROPE", severity: "info" },
  { pattern: /\b(i hope this helps|let me know if you have questions)\b/gi, message: "Chatbot conversational closer left in document.", id: "VOCAB-CHATBOT-CLOSER", severity: "error" }
];

/**
 * Checks text lines against the vocabulary rules.
 * @param {string[]} lines
 * @returns {Array<{line: number, column: number, message: string, id: string, severity: string, match: string}>}
 */
export function checkVocabulary(lines) {
  const issues = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const rule of BUZZWORDS) {
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
