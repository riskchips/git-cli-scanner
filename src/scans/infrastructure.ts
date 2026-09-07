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
