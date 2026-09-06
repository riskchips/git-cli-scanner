#!/usr/bin/env node
import { Command } from 'commander';
import { scanDiff } from './scanner';
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
npx git-cli-scanner scan
`.trim();

      fs.writeFileSync(hookPath, hookContent, 'utf-8');
      success('Successfully installed pre-commit hook!');
      info('Next time you run `git commit`, the scanner will automatically scan your staged files.');
    } catch (err: any) {
      error(`Failed to initialize: ${err.message}`);
    }
  });

program
  .command('disable')
  .description('Remove the pre-commit hook and disable automatic scanning')
  .action(() => {
    try {
      const hookPath = path.join(process.cwd(), '.husky', 'pre-commit');
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
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
  .description('Interactive vulnerability scan for staged files')
  .option('--show-sol', 'Show solutions for vulnerabilities')
  .action(async (options) => {
    info('Git CLI Scanner running...');
    
    try {

      const spinner = new Spinner([
        'Scanning staged files for vulnerabilities...',
        'Analyzing code patterns...',
        'Checking for exposed API keys...',
        'Inspecting hidden files and directories...',
        'Thinking...'
      ]);
      spinner.start();
      
      // Simulate a small delay for UX so the animation is visible
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const issues = await scanDiff();
      
      if (issues.length > 0) {
        // Filter out dummy issues from blocking the commit, but still print them
        const blockerIssues = issues.filter(i => i.severity !== 'dummy');
        
        spinner.fail(`Found ${issues.length} potential vulnerabilities! (${blockerIssues.length} blockers)`);
        
        const { printIssues } = require('./utils/logger');
        printIssues(issues, options.showSol);

        if (blockerIssues.length === 0) {
          info('No high or medium vulnerabilities found. Safe to commit!');
          process.exit(0);
        }

        const shouldContinue = await askToContinue();
        if (shouldContinue) {
          info('Proceeding with commit despite vulnerabilities.');
          process.exit(0);
        } else {
          error('Commit aborted. Please edit your files and try again.');
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
  .command('explore')
  .description('Launch an interactive Terminal UI to browse and scan files')
  .action(async () => {
    try {
      const { explorePrompt } = require('./utils/explorer');
      await explorePrompt({ currentDir: process.cwd() });
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
