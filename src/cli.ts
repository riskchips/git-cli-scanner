#!/usr/bin/env node
import { Command } from 'commander';
import { scanDiff, scanDirectory, scanHistoryDiffs } from './scanner';
import { error, success, info } from './utils/logger';
import { askToScan, askToContinue } from './utils/prompts';
import { Spinner } from './utils/spinner';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('git-cli-scanner')
  .description('Interactive Git hooks vulnerability scanner')
  .version('1.3.0');

program
  .command('init')
  .description('Install pre-commit hook for automatic scanning')
  .action(() => {
    info('Setting up pre-commit hook...');
    try {
      // Check if .git exists
      const gitDir = path.join(process.cwd(), '.git');
      if (!fs.existsSync(gitDir)) {
        error('Not a git repository. Run `git init` first.');
        process.exit(1);
      }

      // Create hooks directory if it doesn't exist
      const hooksDir = path.join(gitDir, 'hooks');
      if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
      }

      const hookPath = path.join(hooksDir, 'pre-commit');
      const hookContent = `#!/bin/sh
# git-cli-scanner pre-commit hook
# exec < /dev/tty is required to allow interactive prompts in git hooks
exec < /dev/tty
npx git-cli-scanner scan --hook
`;

      fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
      
      // If the user previously used Husky, core.hooksPath might be set to .husky/
      // Unset it so it falls back to the default .git/hooks path
      try {
        execSync('git config --unset core.hooksPath', { stdio: 'ignore' });
      } catch (e) {
        // Ignore if not set
      }

      success('Pre-commit hook installed!');
      info('Every `git commit` will now automatically scan your staged files.');
    } catch (err: any) {
      error(`Failed to initialize: ${err.message}`);
    }
  });

program
  .command('disable')
  .description('Remove the pre-commit hook and disable automatic scanning')
  .action(() => {
    try {
      // Check both .git/hooks and .husky locations
      const gitHookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
      const huskyHookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      let removed = false;

      if (fs.existsSync(gitHookPath)) {
        fs.unlinkSync(gitHookPath);
        removed = true;
      }
      if (fs.existsSync(huskyHookPath)) {
        fs.unlinkSync(huskyHookPath);
        removed = true;
      }

      if (removed) {
        success('Pre-commit hook removed. Automatic scanning is now disabled.');
      } else {
        info('No pre-commit hook found. Nothing to disable.');
      }
    } catch (err: any) {
      error(`Failed to disable: ${err.message}`);
    }
  });

program
  .command('scan')
  .description('Scan staged files for vulnerabilities')
  .option('--show-sol', 'Show solutions for vulnerabilities')
  .option('--hook', 'Internal flag used when running as a git hook')
  .action(async (options) => {
    info('Git CLI Scanner running...');
    
    try {

      const spinnerMsgs = options.hook ? [
        'Scanning staged files for vulnerabilities...',
        'Analyzing code patterns...',
        'Checking for exposed API keys...',
        'Thinking...'
      ] : [
        'Scanning entire repository for vulnerabilities...',
        'Analyzing code patterns...',
        'Checking for exposed API keys...',
        'Inspecting hidden files and directories...',
        'Thinking...'
      ];

      const spinner = new Spinner(spinnerMsgs);
      spinner.start();
      
      // Simulate a small delay for UX so the animation is visible
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const issues = options.hook ? await scanDiff() : await scanDirectory(process.cwd());
      
      if (issues.length > 0) {
        // Filter out dummy issues from blocking the commit, but still print them
        const blockerIssues = issues.filter(i => i.severity !== 'dummy');
        
        spinner.fail(`Found ${issues.length} potential vulnerabilities! (${blockerIssues.length} blockers)`);
        
        const { printIssues } = require('./utils/logger');
        printIssues(issues, options.showSol);

        if (blockerIssues.length === 0) {
          info(options.hook ? 'No high or medium vulnerabilities found. Safe to commit!' : 'No high or medium vulnerabilities found.');
          process.exit(0);
        }

        const shouldContinue = await askToContinue(!!options.hook);
        if (shouldContinue) {
          info(options.hook ? 'Proceeding with commit despite vulnerabilities.' : 'Proceeding despite vulnerabilities.');
          process.exit(0);
        } else {
          error(options.hook ? 'Commit aborted. Please edit your files and try again.' : 'Scan aborted. Please fix the issues.');
          process.exit(1);
        }
      } else {
        spinner.stop('No vulnerabilities found. Safe to commit!');
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

program
  .command('scan-all [dir]')
  .description('Scan an entire directory or codebase for vulnerabilities')
  .option('--show-sol', 'Show solutions for vulnerabilities')
  .action(async (dir, options) => {
    const scanDir = dir || process.cwd();
    info(`Scanning directory: ${scanDir}`);
    
    try {
      const spinner = new Spinner([
        'Walking directory and reading files...',
        'Analyzing code patterns...',
        'Checking for exposed API keys...',
        'Inspecting hidden files and directories...',
        'Thinking...'
      ]);
      spinner.start();
      
      // We need to import scanDirectory dynamically or add it to imports
      const { scanDirectory } = await import('./scanner');
      
      // Small UX delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const issues = await scanDirectory(scanDir);
      
      if (issues.length > 0) {
        const blockerIssues = issues.filter(i => i.severity !== 'dummy');
        
        spinner.fail(`Found ${issues.length} potential vulnerabilities! (${blockerIssues.length} blockers)`);
        
        const { printIssues } = require('./utils/logger');
        printIssues(issues, options.showSol);
        
        if (blockerIssues.length > 0) {
          process.exit(1);
        } else {
          process.exit(0);
        }
      } else {
        spinner.stop('No vulnerabilities found. Directory is safe!');
        process.exit(0);
      }
    } catch (err: any) {
      error(`Scanner failed: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('scan-history')
  .description('Scan Git commit history for exposed secrets (defaults to last commit)')
  .option('--show-sol', 'Show solutions for vulnerabilities')
  .option('--since <date>', 'Scan commits since a specific date (e.g. "30 days ago")')
  .option('--id <hash>', 'Scan a specific commit hash')
  .option('--all', 'Scan all branches and history')
  .action(async (options) => {
    info('Git CLI Scanner (History Mode) running...');
    
    try {
      const spinnerMsgs = [
        'Rewinding Git history...',
        'Extracting historical diffs...',
        'Scanning temporal anomalies...',
        'Looking for buried secrets...',
        'Thinking...'
      ];

      const spinner = new Spinner(spinnerMsgs);
      spinner.start();
      
      // Simulate a small delay for UX
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const issues = await scanHistoryDiffs({
        since: options.since,
        id: options.id,
        all: options.all
      });
      
      if (issues.length > 0) {
        const blockerIssues = issues.filter(i => i.severity !== 'dummy');
        spinner.fail(`Found ${issues.length} historical vulnerabilities! (${blockerIssues.length} blockers)`);
        
        const { printIssues } = require('./utils/logger');
        printIssues(issues, options.showSol);
      } else {
        spinner.succeed('No vulnerabilities found in the scanned history!');
      }
    } catch (err: any) {
      error(`History scan failed: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('explore')
  .description('Launch an interactive Terminal UI to browse and scan files')
  .action(async () => {
    try {
      const { runExplorer } = require('./utils/explorer');
      await runExplorer(process.cwd());
      process.exit(0);
    } catch (err: any) {
      if (err.name === 'ExitPromptError' || err.message?.includes('closed')) {
        process.exit(0);
      }
      error(`Explorer failed: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
