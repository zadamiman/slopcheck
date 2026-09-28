export interface LintIssue {
  line: number;
  column: number;
  message: string;
  id: string;
  severity: 'error' | 'warning' | 'info';
  match: string;
}

export interface FileLintResult {
  file: string;
  issues: LintIssue[];
}

export function lintContent(content: string, filename?: string): LintIssue[];
export function lintFile(filePath: string): FileLintResult;
export function resolveFiles(targets: string[], ignore?: string[]): string[];
export function formatPretty(results: FileLintResult[]): string;
export function formatJson(results: FileLintResult[]): string;
export function formatGithub(results: FileLintResult[]): string;
