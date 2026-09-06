import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'github-pat',
    description: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
    risk: 'Attackers can read, modify, or delete your entire private source code and infrastructure configurations.',
    solution: 'Revoke this token immediately in your GitHub Developer Settings. For automated workflows, use a fine-grained PAT or GitHub Apps.'
  },
  {
    id: 'github-oauth',
    description: 'GitHub OAuth Access Token',
    pattern: /gho_[a-zA-Z0-9]{36}/,
    risk: 'Grants third-party level access to GitHub accounts, leading to source code theft or supply chain attacks.',
    solution: 'Revoke the OAuth token via GitHub Settings > Authorized OAuth Apps. Never hardcode OAuth tokens.'
  },
  {
    id: 'slack-token',
    description: 'Slack Token',
    pattern: /xox[pboar]-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{32}/,
    risk: 'An attacker can read private messages, extract company secrets, and socially engineer employees using internal channels.',
    solution: 'Regenerate the Slack App Token in your Slack API Dashboard. If pushed, an attacker can access your internal team communications.'
  },
  {
    id: 'slack-webhook',
    description: 'Slack Webhook',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,10}\/B[a-zA-Z0-9_]{8,10}\/[a-zA-Z0-9_]{24}/,
    risk: 'Allows unauthenticated actors to spam or spoof messages into your internal team channels.',
    solution: 'Delete the webhook in Slack and create a new one. Load the webhook URL via environment variables in production.'
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
              match: cleanLine.trim().substring(0, 50) + '...',
              severity: 'high',
              solution: rule.solution,
              risk: rule.risk
            });
          }
        }
      }
      lineNumber++;
    }

    return issues;
  }
};
