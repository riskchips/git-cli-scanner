#!/usr/bin/env node
import { Command } from 'commander';
import { scanDiff } from './scanner';
import { error, success, info } from './utils/logger';
import { askToScan, askToContinue } from './utils/prompts';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('github-cli-scanner')
  .description('Interactive Git hooks vulnerability scanner')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize husky and add the pre-commit hook automatically')
  .action(() => {
    info('Setting up git hooks with husky...');
    try {
      execSync('npx husky init', { stdio: 'inherit' });
      
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      // For interactive hooks, we need to read from /dev/tty
      // Husky executes hooks as shell scripts. To allow interactive prompts,
      // we attach the command's stdin to the tty.
      const hookContent = `
# exec < /dev/tty is required to allow interactive prompts in git hooks
exec < /dev/tty
npx github-cli-scanner scan
`.trim();

      fs.writeFileSync(hookPath, hookContent, 'utf-8');
      success('Successfully installed pre-commit hook!');
      info('Next time you run `git commit`, the scanner will prompt you.');
    } catch (err: any) {
      error(`Failed to initialize: ${err.message}`);
    }
  });

program
  .command('scan')
  .description('Interactive vulnerability scan for staged files')
  .action(async () => {
    info('GitHub CLI Scanner triggered by Git Hook.');
    
    try {
      const shouldScan = await askToScan();
      if (!shouldScan) {
        info('Skipping scan as requested. Proceeding with commit...');
        process.exit(0);
      }

      info('Scanning staged files for vulnerabilities...');
      const issues = await scanDiff();
      
      if (issues.length > 0) {
        error(`Found ${issues.length} potential vulnerabilities!`);
        issues.forEach(issue => {
          console.error(`\n- [${issue.type}] File: ${issue.file}, Line: ${issue.line}`);
          console.error(`  Match: ${issue.match}`);
        });

        const shouldContinue = await askToContinue();
        if (shouldContinue) {
          info('Proceeding with commit despite vulnerabilities.');
          process.exit(0);
        } else {
          error('Commit aborted. Please edit your files and try again.');
          process.exit(1);
        }
      } else {
        success('No vulnerabilities found. Safe to commit!');
        process.exit(0);
      }
    } catch (err: any) {
      // Inquirer throws when user presses Ctrl+C
      if (err.name === 'ExitPromptError' || err.message?.includes('closed')) {
        error('Scan aborted by user.');
        process.exit(1); // Abort commit if they ctrl+c the prompt
      }
      error(`Scanner failed: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
