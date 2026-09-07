import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'npm-token',
    description: 'NPM Access Token',
    pattern: /(?:npm|NPM)[_-]?(?:token|TOKEN)[\s:=]+["'](?:npm_[a-zA-Z0-9]{36})["']/i,
    risk: 'Attackers can publish malicious versions of your packages (Supply Chain Attack) to compromise all users downloading your code.',
    solution: 'Revoke the token immediately on npmjs.com and check your package versions for unauthorized releases.'
  },
  {
    id: 'pypi-token',
    description: 'PyPI Access Token',
    pattern: /pypi-[a-zA-Z0-9_-]{50,}/,
    risk: 'Attackers can upload malicious packages to PyPI under your name, distributing malware to your downstream users.',
    solution: 'Revoke the token in your PyPI account settings immediately and inspect recent package uploads.'
  },
  {
    id: 'maven-gradle-password',
    description: 'Maven/Gradle Repository Password',
    pattern: /(?:maven|gradle|nexus|artifactory)[\w\-]*password[\s:=]+["'][a-zA-Z0-9\-_!@#$%^&*()=+]{8,}["']/i,
    risk: 'Attackers can access your private artifact repository, steal proprietary code, or inject backdoors into your Java packages.',
    solution: 'Change your repository password and remove it from the hardcoded configuration file (e.g. settings.xml).'
  }
];

export const packageRegistryScanner: Scanner = {
  id: 'package-registries',
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
