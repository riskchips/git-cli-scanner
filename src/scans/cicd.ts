import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'gitlab-ci-token',
    description: 'GitLab Personal Access Token',
    pattern: /glpat-[a-zA-Z0-9\-]{20,}/,
    risk: 'Attackers can access your GitLab repositories, modify CI/CD pipelines, and steal sensitive code or deployment secrets.',
    solution: 'Revoke the token in your GitLab account (User Settings > Access Tokens) and use environment variables for CI authentication.'
  },
  {
    id: 'github-actions-token',
    description: 'GitHub Actions Token / Fine-grained PAT',
    pattern: /gh[p|a|s|r]_[a-zA-Z0-9]{36}/,
    risk: 'Compromised GitHub tokens can allow attackers to push code, trigger malicious Actions workflows, or steal repository secrets.',
    solution: 'Revoke the token immediately in GitHub (Settings > Developer Settings) and switch to short-lived GitHub App tokens if possible.'
  },
  {
    id: 'jenkins-token',
    description: 'Jenkins Token or API Secret',
    pattern: /(?:jenkins)[\w\-]*(?:token|secret|password)[\s:=]+["'][a-zA-Z0-9]{32}["']/i,
    risk: 'Attackers can trigger or modify your Jenkins build pipelines, leading to malicious deployments or lateral movement.',
    solution: 'Revoke the API token in the Jenkins User Configuration page and inject secrets using the Jenkins Credentials Manager.'
  }
];

export const cicdScanner: Scanner = {
  id: 'cicd-secrets',
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
              severity: 'critical',
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
