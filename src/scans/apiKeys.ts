import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'stripe-key',
    description: 'Stripe Secret/Restricted Key',
    pattern: /(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24}/,
    risk: 'An attacker can issue unauthorized refunds, access customer payment data, or disrupt billing operations.',
    solution: 'Revoke in Stripe Dashboard (Developers > API keys). Use a secret manager (e.g. AWS Secrets Manager, Doppler) or .env files, and load via process.env.',
  },
  {
    id: 'sendgrid-key',
    description: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
    risk: 'Allows unauthorized sending of emails from your domains, leading to phishing campaigns and domain blacklisting.',
    solution: 'Revoke in Twilio SendGrid UI (Settings > API Keys). Store the new key securely using environment variables.',
  },
  {
    id: 'mailgun-key',
    description: 'Mailgun API Key',
    pattern: /key-[0-9a-zA-Z]{32}/,
    risk: 'Allows an attacker to read incoming emails, send spam, and permanently ruin your email domain reputation.',
    solution: 'Rotate the key immediately in Mailgun Settings. Hardcoded Mailgun keys can lead to severe email spoofing and domain reputation loss.',
  },
  {
    id: 'twilio-key',
    description: 'Twilio API Key',
    pattern: /SK[0-9a-fA-F]{32}/,
    risk: 'Attackers can incur massive financial charges via SMS toll fraud or hijack phone numbers.',
    solution: 'Delete this key in the Twilio Console (Account > API keys & tokens). Never hardcode communication API keys.',
  },
  {
    id: 'generic-api-key',
    description: 'Generic API Key / Secret / Password / Passphrase',
    pattern: /(?:api[_\-]?key|secret|token|password|pwd|passphrase)[\s:=]+["'][a-zA-Z0-9\-_!@#$%^&*()=+]{8,}["']/i,
    risk: 'Generic secrets often grant unrestricted access to databases, third-party APIs, or internal microservices.',
    solution: 'Extract this secret into a local .env file. Ensure .env is added to your .gitignore so it never enters source control.',
  },
  {
    id: 'generic-bearer-token',
    description: 'Generic Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9\-_.]{20,}/i,
    risk: 'Bearer tokens allow impersonation of users or service accounts to access protected REST APIs directly.',
    solution: 'Bearer tokens grant direct access to APIs. Remove it from code, revoke the session, and inject it securely at runtime.',
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
