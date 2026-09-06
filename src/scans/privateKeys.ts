import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'rsa-private-key',
    description: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/,
    solution: 'RSA keys should never enter source control. Rotate this key on all associated servers/services and use a secure keystore like AWS KMS or HashiCorp Vault.'
  },
  {
    id: 'openssh-private-key',
    description: 'OpenSSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/,
    solution: 'This SSH key could grant direct server access. Generate a new SSH keypair (`ssh-keygen`), replace the public key on your servers, and delete this leaked private key.'
  },
  {
    id: 'pgp-private-key',
    description: 'PGP Private Key',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
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
              solution: rule.solution
            });
          }
        }
      }
      lineNumber++;
    }

    return issues;
  }
};
