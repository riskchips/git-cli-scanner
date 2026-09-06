export interface Rule {
  id: string;
  description: string;
  pattern: RegExp;
}

export const rules: Rule[] = [
  {
    id: 'aws-access-key',
    description: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  },
  {
    id: 'generic-api-key',
    description: 'Generic API Key / Secret',
    pattern: /(?:api_?key|secret|token|password)[\s:=]+["'][a-zA-Z0-9\-_]{16,}["']/i,
  },
  {
    id: 'github-pat',
    description: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
  }
];
