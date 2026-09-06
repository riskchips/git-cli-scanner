import { Scanner } from './types';
import { apiKeyScanner } from './apiKeys';
import { cloudProviderScanner } from './cloudProviders';
import { collaborationScanner } from './collaboration';
import { privateKeyScanner } from './privateKeys';
import { envFileScanner } from './envFiles';

export const allScanners: Scanner[] = [
  apiKeyScanner,
  cloudProviderScanner,
  collaborationScanner,
  privateKeyScanner,
  envFileScanner,
];

export { Scanner, ScanIssue } from './types';
