import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'aws-access-key',
    description: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    risk: 'An attacker can use this to spin up thousands of crypto-mining EC2 instances, costing you massive amounts of money.',
    solution: 'Deactivate the key in AWS IAM Console immediately. Switch to using short-lived credentials via AWS STS or IAM Roles whenever possible.'
  },
  {
    id: 'aws-secret-key',
    description: 'AWS Secret Access Key (heuristics)',
    pattern: /aws_?(?:secret)?_?(?:access)?_?key[\s:=]+["'][a-zA-Z0-9\/+]{40}["']/i,
    risk: 'Compromised AWS Secret Keys grant direct access to your entire cloud infrastructure, databases, and storage buckets.',
    solution: 'This secret grants access to your AWS infrastructure. Remove it from the codebase and inject it using a secure CI/CD secrets manager or HashiCorp Vault.'
  },
  {
    id: 'gcp-api-key',
    description: 'Google Cloud API Key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
    risk: 'Attackers can bypass quotas to abuse GCP services like Maps API or Vertex AI, causing high billing charges.',
    solution: 'Restrict the key in Google Cloud Console (APIs & Services > Credentials) to specific IP addresses/apps, or revoke it and use GCP Service Accounts.'
  },
  {
    id: 'firebase-secret',
    description: 'Firebase API Key or Secret',
    pattern: /firebase[_-]?(?:api[_-]?key|secret)[\s:=]+["']?[a-zA-Z0-9\-_]{30,}["']?/i,
    risk: 'Attackers can bypass security rules, read/write to your Firebase database, or exhaust quotas.',
    solution: 'Revoke the key in the Firebase console and restrict new keys to specific domains or IP addresses.'
  },
  {
    id: 'firebase-service-account',
    description: 'Firebase Service Account JSON (Heuristic)',
    pattern: /"type"\s*:\s*"service_account"|-----BEGIN PRIVATE KEY-----/i,
    risk: 'Service accounts grant full administrative access to your Firebase project, including databases, auth, and storage.',
    solution: 'Delete the service account key in Google Cloud IAM and never commit service account JSON files. Use environment variables.'
  },
  {
    id: 'digitalocean-token',
    description: 'DigitalOcean Personal Access Token',
    pattern: /dop_v1_[a-f0-9]{64}/,
    risk: 'Attackers can spin up or delete Droplets, compromising your infrastructure and causing severe financial damage.',
    solution: 'Revoke the token immediately in the DigitalOcean control panel (API > Tokens/Keys).'
  },
  {
    id: 'datadog-key',
    description: 'Datadog API / Client Key',
    pattern: /(?:datadog|dd)[_-]?(?:api[_-]?key|client[_-]?token)[\s:=]+["']?[a-f0-9]{32}["']?/i,
    risk: 'Attackers can pollute your observability metrics or read infrastructure configuration data.',
    solution: 'Rotate the API key in Datadog (Organization Settings > API Keys).'
  }
];

export const cloudProviderScanner: Scanner = {
  id: 'cloud-providers',
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
