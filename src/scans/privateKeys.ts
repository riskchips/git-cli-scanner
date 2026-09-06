import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'rsa-private-key',
    description: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/,
    risk: 'Allows attackers to decrypt intercepted traffic, forge digital signatures, or authenticate to your infrastructure.',
    solution: 'RSA keys should never enter source control. Rotate this key on all associated servers/services and use a secure keystore like AWS KMS or HashiCorp Vault.'
  },
  {
    id: 'openssh-private-key',
    description: 'OpenSSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/,
    risk: 'Attackers can use this to SSH directly into your production servers, clone private repos, or pivot into your internal network.',
    solution: 'This SSH key could grant direct server access. Generate a new SSH keypair (`ssh-keygen`), replace the public key on your servers, and delete this leaked private key.'
  },
  {
    id: 'pgp-private-key',
    description: 'PGP Private Key',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
    risk: 'An attacker can impersonate you to sign malicious software releases or decrypt highly sensitive PGP-encrypted messages.',
    solution: 'Revoke this PGP key via your keyserver immediately, as it can be used to forge digital signatures or decrypt sensitive payloads.'
  },
];

export const privateKeyScanner: Scanner = {
  id: 'private-keys',
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
