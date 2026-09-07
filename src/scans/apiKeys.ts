import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

const rules = [
  {
    id: 'stripe-key',
    description: 'Stripe Secret/Restricted Key',
    pattern: /(?:sk|rk)_(?:test|live)_[0-9a-zA-Z]{24}/,
    risk: 'An attacker can issue unauthorized refunds, access customer payment data, or disrupt billing operations.',
    solution: 'Revoke in Stripe Dashboard (Developers > API keys). Use a secret manager (e.g. AWS Secrets Manager, Doppler) or .env files, and load via process.env.',
  },
  {
    id: 'sendgrid-key',
    description: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/,
    risk: 'Allows unauthorized sending of emails from your domains, leading to phishing campaigns and domain blacklisting.',
    solution: 'Revoke in Twilio SendGrid UI (Settings > API Keys). Store the new key securely using environment variables.',
  },
  {
    id: 'mailgun-key',
    description: 'Mailgun API Key',
    pattern: /key-[0-9a-zA-Z]{32}/,
    risk: 'Allows an attacker to read incoming emails, send spam, and permanently ruin your email domain reputation.',
    solution: 'Rotate the key immediately in Mailgun Settings. Hardcoded Mailgun keys can lead to severe email spoofing and domain reputation loss.',
  },
  {
    id: 'twilio-key',
    description: 'Twilio API Key',
    pattern: /SK[0-9a-fA-F]{32}/,
    risk: 'Attackers can incur massive financial charges via SMS toll fraud or hijack phone numbers.',
    solution: 'Delete this key in the Twilio Console (Account > API keys & tokens). Never hardcode communication API keys.',
  },
  {
    id: 'generic-api-key',
    description: 'Generic API Key / Secret / Password / Passphrase',
    pattern: /(?:api[_\-]?key|secret|token|password|pwd|passphrase)[\s:=]+["'][a-zA-Z0-9\-_!@#$%^&*()=+]{8,}["']/i,
    risk: 'Generic secrets often grant unrestricted access to databases, third-party APIs, or internal microservices.',
    solution: 'Extract this secret into a local .env file. Ensure .env is added to your .gitignore so it never enters source control.',
  },
  {
    id: 'generic-bearer-token',
    description: 'Generic Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9\-_.]{20,}/i,
    risk: 'Bearer tokens allow impersonation of users or service accounts to access protected REST APIs directly.',
    solution: 'Bearer tokens grant direct access to APIs. Remove it from code, revoke the session, and inject it securely at runtime.',
  },
  {
    id: 'telegram-bot-token',
    description: 'Telegram Bot Token',
    pattern: /[0-9]{9,10}:[a-zA-Z0-9_-]{35}/,
    risk: 'Attackers can hijack your Telegram bot to spam users or read incoming messages.',
    solution: 'Revoke the token using BotFather on Telegram and use environment variables.',
  },
  {
    id: 'shopify-token',
    description: 'Shopify Access/Custom App Token',
    pattern: /shp(?:at|ca)_[a-fA-F0-9]{32}/,
    risk: 'Attackers can access your Shopify store data, modify products, or access customer information.',
    solution: 'Revoke the token in the Shopify Admin console and securely inject a new one.',
  },
  {
    id: 'square-secret',
    description: 'Square Access Token / OAuth Secret',
    pattern: /sq0(?:atp|csp)-[0-9A-Za-z\-_]{22,43}/,
    risk: 'Attackers can process fraudulent payments, issue refunds, or access customer data.',
    solution: 'Rotate the secret in the Square Developer Dashboard.',
  },
  {
    id: 'github-app-token',
    description: 'GitHub App Token',
    pattern: /(?:ghu|ghs)_[0-9a-zA-Z]{36}/,
    risk: 'Attackers can access your repositories, push malicious code, or modify your organization settings depending on the app permissions.',
    solution: 'Revoke the token in GitHub and configure your App to use short-lived tokens securely.',
  },
  {
    id: 'openai-api-key',
    description: 'OpenAI API Key',
    pattern: /sk-(?:proj-|ant-)?[A-Za-z0-9]{40,48}/,
    risk: 'Attackers can consume your AI credits, resulting in massive financial charges and potentially accessing your fine-tuned models.',
    solution: 'Revoke the key in the OpenAI Dashboard and ensure your API keys are injected at runtime.',
  },
  {
    id: 'anthropic-api-key',
    description: 'Anthropic API Key',
    pattern: /sk-ant-api03-[A-Za-z0-9\-_]{90,}/,
    risk: 'Attackers can consume your Claude API credits, causing financial damage.',
    solution: 'Revoke the API key in the Anthropic console.',
  },
  {
    id: 'huggingface-token',
    description: 'HuggingFace Token',
    pattern: /hf_[A-Za-z0-9]{34}/,
    risk: 'Attackers can access your private models, datasets, or consume inference API quotas.',
    solution: 'Revoke the token in HuggingFace (Settings > Access Tokens).',
  },
  {
    id: 'asana-token',
    description: 'Asana Personal Access Token',
    pattern: /0\/[0-9a-fA-F]{32}/,
    risk: 'Attackers can view, modify, or delete tasks and projects across your organization.',
    solution: 'Revoke the token in the Asana Developer Console.',
  },
  {
    id: 'npm-token',
    description: 'NPM Access Token',
    pattern: /npm_[a-zA-Z0-9]{36}/,
    risk: 'Attackers can publish malicious packages under your name, leading to supply chain attacks.',
    solution: 'Revoke the token in your NPM account settings immediately.',
  },
];

export const apiKeyScanner: Scanner = {
  id: 'api-keys',
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
