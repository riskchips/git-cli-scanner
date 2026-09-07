import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'docker-hub-token',
    description: 'Docker Hub Personal Access Token',
    pattern: /dckr_pat_[a-zA-Z0-9_\-]{25,}/,
    risk: 'An attacker can push malicious images to your Docker registries, leading to a supply chain attack on your production containers.',
    solution: 'Revoke this token immediately in Docker Hub (Account Settings > Security > New Access Token) and replace it using CI/CD secrets.'
  },
  {
    id: 'database-connection-string',
    description: 'Database Connection String with Credentials',
    pattern: /(?:postgres|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\/\s]+:[^@\/\s]+@[^:\/\s]+(?::\d+)?\//,
    risk: 'An attacker can directly connect to your database instance, allowing them to steal, modify, or delete all of your user data.',
    solution: 'Remove the hardcoded database URL and read it from an environment variable (e.g., process.env.DATABASE_URL) at runtime.'
  },
  {
    id: 'smtp-credentials',
    description: 'SMTP Email Credentials',
    pattern: /(?:smtp|mail|sendgrid|mailgun)[\w\-]*(?:password|secret|key)[\s:=]+["']?[^"'\s]+["']?/i,
    risk: 'Attackers can use your SMTP server to send spam or phishing emails, ruining your domain reputation and incurring massive costs.',
    solution: 'Change the SMTP password via your email provider and inject it securely using a secrets manager.'
  },
  {
    id: 'terraform-helm-secret',
    description: 'Terraform / Helm Variable Secret',
    pattern: /(?:tf_var|helm_var)_[a-zA-Z0-9_]+[\s:=]+["']?[^"'\s]+["']?/i,
    risk: 'Hardcoded infrastructure secrets can grant access to the underlying platform resources and services.',
    solution: 'Use a proper secrets management backend for Terraform (e.g. Vault) or pass secrets via CI/CD runners.'
  },
  {
    id: 'ngrok-token',
    description: 'Ngrok Auth Token',
    pattern: /(?:ngrok)[_-]?(?:auth[_-]?)?(?:token)?[\s:=]+["']?[a-zA-Z0-9_-]{40,50}["']?/i,
    risk: 'Attackers can use your Ngrok account to host malicious tunnels or bypass local network security.',
    solution: 'Revoke the token in the Ngrok Dashboard and update your configuration.'
  },
  {
    id: 'sentry-token',
    description: 'Sentry Auth Token',
    pattern: /sntrys_[a-zA-Z0-9_-]{64}/,
    risk: 'Attackers can access your error monitoring data, potentially exposing sensitive environment variables or stack traces.',
    solution: 'Revoke the auth token in Sentry (Settings > Account > API > Auth Tokens).'
  }
];

export const infrastructureScanner: Scanner = {
  id: 'infrastructure',
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
