import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'github-pat',
    description: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
  },
  {
    id: 'github-oauth',
    description: 'GitHub OAuth Access Token',
    pattern: /gho_[a-zA-Z0-9]{36}/,
  },
  {
    id: 'slack-token',
    description: 'Slack Token',
    pattern: /xox[pboar]-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{32}/,
  },
  {
    id: 'slack-webhook',
    description: 'Slack Webhook',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,10}\/B[a-zA-Z0-9_]{8,10}\/[a-zA-Z0-9_]{24}/,
  },
];

export const collaborationScanner: Scanner = {
  id: 'collaboration',
  scan(diff: GitDiff): ScanIssue[] {
    const issues: ScanIssue[] = [];
    const lines = diff.content.split('\n');
    let lineNumber = 1;

    for (const line of lines) {
      if (line.startsWith('+')) {
        const cleanLine = line.substring(1);
        for (const rule of rules) {
          if (rule.pattern.test(cleanLine)) {
            issues.push({
              type: rule.id,
              file: diff.file,
              line: lineNumber,
              match: cleanLine.trim().substring(0, 50) + '...'
            });
          }
        }
      }
      lineNumber++;
    }

    return issues;
  }
};
