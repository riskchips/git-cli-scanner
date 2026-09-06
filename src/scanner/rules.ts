export interface Rule {
  id: string;
  description: string;
  pattern: RegExp;
}

export const rules: Rule[] = [
  // Cloud Providers
  {
    id: 'aws-access-key',
    description: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
  },
  {
    id: 'aws-secret-key',
    description: 'AWS Secret Access Key (heuristics)',
    pattern: /(?i)aws_?(?:secret)?_?(?:access)?_?key[\s:=]+["'][a-zA-Z0-9\/+]{40}["']/,
  },
  {
    id: 'gcp-api-key',
    description: 'Google Cloud API Key',
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
  },
  
  // Git & Collaboration
  {
    id: 'github-pat',
    description: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
  },
  {
    id: 'github-oauth',
    description: 'GitHub OAuth Access Token',
    pattern: /gho_[a-zA-Z0-9]{36}/,
  },
  {
    id: 'slack-token',
    description: 'Slack Token',
    pattern: /xox[pboar]-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{10,13}-[a-zA-Z0-9]{32}/,
  },
  {
    id: 'slack-webhook',
    description: 'Slack Webhook',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,10}\/B[a-zA-Z0-9_]{8,10}\/[a-zA-Z0-9_]{24}/,
  },

  // Payment & Services
  {
    id: 'stripe-key',
    description: 'Stripe Secret/Restricted Key',
    pattern: /(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24}/,
  },
  {
    id: 'sendgrid-key',
    description: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
  },
  {
    id: 'mailgun-key',
    description: 'Mailgun API Key',
    pattern: /key-[0-9a-zA-Z]{32}/,
  },
  {
    id: 'twilio-key',
    description: 'Twilio API Key',
    pattern: /SK[0-9a-fA-F]{32}/,
  },

  // Cryptography & Keys
  {
    id: 'rsa-private-key',
    description: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/,
  },
  {
    id: 'openssh-private-key',
    description: 'OpenSSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/,
  },
  {
    id: 'pgp-private-key',
    description: 'PGP Private Key',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
  },
  
  // Generic Catch-alls
  {
    id: 'generic-api-key',
    description: 'Generic API Key / Secret',
    pattern: /(?:api_?key|secret|token|password)[\s:=]+["'][a-zA-Z0-9\-_]{16,}["']/i,
  },
  {
    id: 'generic-bearer-token',
    description: 'Generic Bearer Token',
    pattern: /(?i)bearer\s+[a-zA-Z0-9\-_.]{20,}/,
  },
];
