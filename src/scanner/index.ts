import { getStagedDiff, GitDiff } from '../utils/git';
import { allScanners, ScanIssue } from '../scans';
import { walkDirectory } from '../utils/fs';

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

export async function scanDirectory(dirPath: string): Promise<ScanIssue[]> {
  const files = walkDirectory(dirPath);
  const issues: ScanIssue[] = [];

  for (const fileData of files) {
    const mockContent = fileData.content
      .split('\n')
      .map(line => '+' + line)
      .join('\n');

    // We mock the format of GitDiff to reuse the scanners
    const mockDiff: GitDiff = {
      file: fileData.file,
      content: mockContent
    };
    for (const scanner of allScanners) {
      issues.push(...scanner.scan(mockDiff));
    }
  }

  return issues;
}

export { ScanIssue };
