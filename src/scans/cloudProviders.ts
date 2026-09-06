import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'aws-access-key',
    description: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  },
  {
    id: 'aws-secret-key',
    description: 'AWS Secret Access Key (heuristics)',
    pattern: /aws_?(?:secret)?_?(?:access)?_?key[\s:=]+["'][a-zA-Z0-9\/+]{40}["']/i,
  },
  {
    id: 'gcp-api-key',
    description: 'Google Cloud API Key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
  },
];

export const cloudProviderScanner: Scanner = {
  id: 'cloud-providers',
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
