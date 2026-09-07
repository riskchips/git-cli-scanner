import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'stripe-secret',
    description: 'Stripe Secret Key / Webhook Secret',
    pattern: /(?:sk_live|rk_live|whsec)_[a-zA-Z0-9]{24,}/,
    risk: 'Attackers can process fraudulent transactions, issue refunds, or steal customer financial data from your Stripe account.',
    solution: 'Roll the secret key immediately in the Stripe Dashboard (Developers > API keys) and monitor recent charges.'
  },
  {
    id: 'paypal-secret',
    description: 'PayPal Client Secret',
    pattern: /paypal[_-]?(?:client[_-]?secret|secret)[\s:=]+["']?[a-zA-Z0-9\-_]{30,}["']?/i,
    risk: 'Attackers can process fraudulent payments, manipulate subscriptions, or steal transaction history.',
    solution: 'Revoke the secret in the PayPal Developer Dashboard and generate a new one.'
  },
  {
    id: 'generic-webhook',
    description: 'Generic Webhook URL (Slack, Discord, etc)',
    pattern: /(?:https?:\/\/)?(?:hooks\.slack\.com|discord\.com\/api\/webhooks|maker\.ifttt\.com)[^\s'"]+/i,
    risk: 'Attackers can spam your internal channels, launch phishing attacks on your team, or exhaust rate limits.',
    solution: 'Delete the webhook in the respective service platform and re-generate a new URL. Do not commit webhook URLs directly.'
  }
];

export const webhooksScanner: Scanner = {
  id: 'webhooks',
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
