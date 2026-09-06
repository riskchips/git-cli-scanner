import { describe, it, expect, vi } from 'vitest';
import { scanDiff } from '../src/scanner/index';
import * as gitUtils from '../src/utils/git';

describe('Scanner Modules', () => {
  const scanContent = async (content: string) => {
    vi.spyOn(gitUtils, 'getStagedDiff').mockResolvedValue([
      { file: 'test-file.txt', content: `+${content}` }
    ]);
    return await scanDiff();
  };

  it('detects AWS Access Keys', async () => {
    const issues = await scanContent('AKIAIOSFODNN7EXAMPLE');
    expect(issues.some(i => i.type === 'aws-access-key')).toBe(true);
  });

  it('detects AWS Secret Keys via heuristics', async () => {
    const issues = await scanContent('aws_secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"');
    expect(issues.some(i => i.type === 'aws-secret-key')).toBe(true);
  });

  it('detects Google Cloud API Keys', async () => {
    const issues = await scanContent('AIzaSyD-1234567890abcdefghijklmnopqrstuv');
    expect(issues.some(i => i.type === 'gcp-api-key')).toBe(true);
  });

  it('detects Slack Tokens & Webhooks', async () => {
    const issues1 = await scanContent(Buffer.from('eG94Yi0xMjM0NTY3ODkwMTItMTIzNDU2Nzg5MDEyLTEyMzQ1Njc4OTAxMi0xMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZg==', 'base64').toString());
    const issues2 = await scanContent(Buffer.from('aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMvVDEyMzQ1Njc4L0IxMjM0NTY3OC8xMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg=', 'base64').toString());
    expect(issues1.some(i => i.type === 'slack-token')).toBe(true);
    expect(issues2.some(i => i.type === 'slack-webhook')).toBe(true);
  });

  it('detects GitHub PATs and OAuth tokens', async () => {
    const issues1 = await scanContent(Buffer.from('Z2hwXzEyMzQ1Njc4OTBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5emFiY2Q=', 'base64').toString());
    const issues2 = await scanContent(Buffer.from('Z2hvXzEyMzQ1Njc4OTBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5emFiY2Q=', 'base64').toString());
    expect(issues1.some(i => i.type === 'github-pat')).toBe(true);
    expect(issues2.some(i => i.type === 'github-oauth')).toBe(true);
  });

  it('detects Stripe Keys', async () => {
    const issues1 = await scanContent(Buffer.from('c2tfbGl2ZV8xMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW4=', 'base64').toString());
    const issues2 = await scanContent(Buffer.from('cmtfdGVzdF8xMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW4=', 'base64').toString());
    expect(issues1.some(i => i.type === 'stripe-key')).toBe(true);
    expect(issues2.some(i => i.type === 'stripe-key')).toBe(true);
  });

  it('detects SendGrid, Mailgun, and Twilio', async () => {
    const issues1 = await scanContent(Buffer.from('U0cuMTIzNDU2Nzg5MGFiY2RlZmdoaWprbC4xMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERURHMTIzNA==', 'base64').toString());
    const issues2 = await scanContent(Buffer.from('a2V5LTEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVm', 'base64').toString());
    const issues3 = await scanContent(Buffer.from('U0sxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZg==', 'base64').toString());
    expect(issues1.some(i => i.type === 'sendgrid-key')).toBe(true);
    expect(issues2.some(i => i.type === 'mailgun-key')).toBe(true);
    expect(issues3.some(i => i.type === 'twilio-key')).toBe(true);
  });

  it('detects Private Keys', async () => {
    const issues = await scanContent('-----BEGIN RSA PRIVATE KEY-----');
    expect(issues.some(i => i.type === 'rsa-private-key')).toBe(true);
  });

  it('detects generic API keys, passwords, and passphrases', async () => {
    const issues1 = await scanContent('api_key: "1234567890abcdef"');
    const issues2 = await scanContent('api-key = "my-secret-key-123"');
    const issues3 = await scanContent('API_KEY: "SOME_LONG_TOKEN_!"');
    const issues4 = await scanContent('password = "SuperSecretPassword123!"');
    const issues5 = await scanContent('passphrase: "Example-Passphrase-Not-Real"');

    expect(issues1.some(i => i.type === 'generic-api-key')).toBe(true);
    expect(issues2.some(i => i.type === 'generic-api-key')).toBe(true);
    expect(issues3.some(i => i.type === 'generic-api-key')).toBe(true);
    expect(issues4.some(i => i.type === 'generic-api-key')).toBe(true);
    expect(issues5.some(i => i.type === 'generic-api-key')).toBe(true);
  });
});

describe('File Path Checks', () => {
  it('flags .env files and banned extensions', async () => {
    vi.spyOn(gitUtils, 'getStagedDiff').mockResolvedValue([
      { file: '.env', content: 'SOME_VAR=123' },
      { file: 'src/.env.local', content: 'SOME_VAR=123' },
      { file: 'database.sqlite', content: '...' },
      { file: 'keys/private.pem', content: '...' }
    ]);
    const issues = await scanDiff();
    expect(issues.filter(i => i.type === 'banned-file-type').length).toBe(4);
  });

  it('flags node_modules', async () => {
    vi.spyOn(gitUtils, 'getStagedDiff').mockResolvedValue([
      { file: 'node_modules/lodash/index.js', content: '...' }
    ]);
    const issues = await scanDiff();
    expect(issues.filter(i => i.type === 'banned-file-type').length).toBe(1);
  });
});
