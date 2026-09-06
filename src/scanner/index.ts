import { getStagedDiff, GitDiff } from '../utils/git';
import { allScanners, ScanIssue } from '../scans';

export async function scanDiff(): Promise<ScanIssue[]> {
  const diffs: GitDiff[] = await getStagedDiff();
  const issues: ScanIssue[] = [];

  for (const diff of diffs) {
    for (const scanner of allScanners) {
      issues.push(...scanner.scan(diff));
    }
  }

  return issues;
}

export async function scanFiles(files: string[]): Promise<ScanIssue[]> {
    // Placeholder for scanning specific files programmatically
    return [];
}

export { ScanIssue };
