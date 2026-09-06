import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

export const envFileScanner: Scanner = {
  id: 'banned-files',
  scan(diff: GitDiff): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    // Check if the file path itself is a problem
    const filename = diff.file.split('/').pop() || '';
    const isBanned = 
      diff.file.includes('.env') || 
      diff.file.startsWith('node_modules/') ||
      filename.endsWith('.pem') ||
      filename.endsWith('.key') ||
      filename.endsWith('.sqlite') ||
      filename.endsWith('.db') ||
      filename.endsWith('.log') ||
      filename.endsWith('.p12') ||
      filename.endsWith('.pfx');

    if (isBanned) {
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
