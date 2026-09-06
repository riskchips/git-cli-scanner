import { getStagedDiff } from '../utils/git';
import { rules } from './rules';

export interface ScanIssue {
  type: string;
  file: string;
  line: number;
  match: string;
}

export async function scanDiff(): Promise<ScanIssue[]> {
  const diffs = await getStagedDiff();
  const issues: ScanIssue[] = [];

  for (const diff of diffs) {
    const lines = diff.content.split('\n');
    let lineNumber = 1; // Simplification, in reality you'd parse git diff line numbers

    for (const line of lines) {
      if (line.startsWith('+')) { // Only check added lines
        const cleanLine = line.substring(1);
        for (const rule of rules) {
          if (rule.pattern.test(cleanLine)) {
            issues.push({
              type: rule.id,
              file: diff.file,
              line: lineNumber,
              match: cleanLine.trim().substring(0, 50) + '...' // truncate for output
            });
          }
        }
      }
      lineNumber++;
    }
  }

  return issues;
}

export async function scanFiles(files: string[]): Promise<ScanIssue[]> {
    // Placeholder for scanning specific files, useful for programmatic usage
    return [];
}
