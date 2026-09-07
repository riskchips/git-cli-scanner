import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'jwt-secret',
    description: 'JWT Secret Key',
    pattern: /(?:jwt[_-]?(?:secret|key)|secret[_-]?key)[\s:=]+["']?[a-zA-Z0-9\-_!@#$%^&*()=+]{16,}["']?/i,
    risk: 'An attacker can forge JWT tokens to impersonate any user, including admins, bypassing all authentication.',
    solution: 'Rotate the secret, ensure all existing JWT sessions are invalidated, and inject it via environment variables.'
  },
  {
    id: 'oauth-client-secret',
    description: 'OAuth Client Secret',
    pattern: /(?:oauth|client)[_-]?(?:secret|key)[\s:=]+["']?[a-zA-Z0-9\-_]{16,}["']?/i,
    risk: 'Attackers can hijack the OAuth flow, authenticate on behalf of your users, or exhaust API quotas.',
    solution: 'Revoke the OAuth client secret in the identity provider console and generate a new one.'
  },
  {
    id: 'session-secret',
    description: 'Session Cookie Secret',
    pattern: /(?:session)[_-]?(?:secret|key)[\s:=]+["']?[a-zA-Z0-9\-_!@#$%^&*()=+]{16,}["']?/i,
    risk: 'Attackers can forge signed session cookies, allowing them to hijack active user sessions.',
    solution: 'Change the session secret to immediately invalidate all current user sessions.'
  }
];

export const authenticationScanner: Scanner = {
  id: 'authentication',
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
