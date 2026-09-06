import { confirm } from '@inquirer/prompts';

export async function askToScan(): Promise<boolean> {
  return await confirm({
    message: 'Do you want to scan for vulnerabilities before committing?',
    default: true,
  });
}

export async function askToContinue(isHook: boolean): Promise<boolean> {
  return await confirm({
    message: isHook 
      ? 'Vulnerabilities were found! Do you still want to continue with the commit?'
      : 'Vulnerabilities were found! Do you want to ignore them?',
    default: false,
  });
}
