import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

export const envFileScanner: Scanner = {
  id: 'env-files',
  scan(diff: GitDiff): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    // Check if the file path itself is a problem (e.g. .env or node_modules)
    if (diff.file.includes('.env') || diff.file.startsWith('node_modules/')) {
      issues.push({
        type: 'banned-file-committed',
        file: diff.file,
        line: 0,
        match: `File or directory should be ignored (e.g., via .gitignore)`
      });
    }

    return issues;
  }
};
