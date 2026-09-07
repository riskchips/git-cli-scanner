import { Scanner } from './types';
import { apiKeyScanner } from './apiKeys';
import { cloudProviderScanner } from './cloudProviders';
import { collaborationScanner } from './collaboration';
import { privateKeyScanner } from './privateKeys';
import { envFileScanner } from './envFiles';
import { infrastructureScanner } from './infrastructure';
import { authenticationScanner } from './authentication';
import { packageRegistryScanner } from './packageRegistries';
import { cicdScanner } from './cicd';
import { webhooksScanner } from './webhooks';

export const allScanners: Scanner[] = [
  apiKeyScanner,
  cloudProviderScanner,
  collaborationScanner,
  privateKeyScanner,
  envFileScanner,
  infrastructureScanner,
  authenticationScanner,
  packageRegistryScanner,
  cicdScanner,
  webhooksScanner,
];

export { Scanner, ScanIssue } from './types';
