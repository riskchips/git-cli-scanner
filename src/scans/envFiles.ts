import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

export const envFileScanner: Scanner = {
  id: 'banned-files',
  scan(diff: GitDiff): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    // Check if the file path itself is a problem
    const filename = diff.file.split('/').pop() || '';
    const bannedExtensions = ['.pem', '.key', '.sqlite', '.db', '.log', '.p12', '.pfx'];
    const isEnvFile = /(^|\/)\.env(\..+)?$/.test(diff.file);
    const isNodeModules = diff.file.startsWith('node_modules/');

    if (isEnvFile || isNodeModules || bannedExtensions.some(ext => diff.file.endsWith(ext))) {
      issues.push({
        type: 'banned-file-type',
        file: diff.file,
        line: 0,
        match: `File extension/name matched banned list`,
        severity: 'medium',
        solution: 'Add this file to .gitignore. If it is a template, rename it to .env.example.'
      });
    }

    return issues;
  }
};
