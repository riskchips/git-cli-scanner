import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'stripe-key',
    description: 'Stripe Secret/Restricted Key',
    pattern: /(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24}/,
  },
  {
    id: 'sendgrid-key',
    description: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
  },
  {
    id: 'mailgun-key',
    description: 'Mailgun API Key',
    pattern: /key-[0-9a-zA-Z]{32}/,
  },
  {
    id: 'twilio-key',
    description: 'Twilio API Key',
    pattern: /SK[0-9a-fA-F]{32}/,
  },
  {
    id: 'generic-api-key',
    description: 'Generic API Key / Secret',
    pattern: /(?:api_?key|secret|token|password)[\s:=]+["'][a-zA-Z0-9\-_]{16,}["']/i,
  },
  {
    id: 'generic-bearer-token',
    description: 'Generic Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9\-_.]{20,}/i,
  },
];

export const apiKeyScanner: Scanner = {
  id: 'api-keys',
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
