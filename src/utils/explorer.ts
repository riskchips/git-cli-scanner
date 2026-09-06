import { select } from '@inquirer/prompts';
import pc from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';
import { scanDirectory } from '../scanner';

interface ExplorerChoice {
  name: string;
  value: string;
  description?: string;
}

async function scanFile(filePath: string, baseDir: string): Promise<void> {
  console.log(`\n${pc.dim('  Scanning')} ${pc.cyan(path.basename(filePath))}${pc.dim('...')}`);
  
  const issues = await scanDirectory(path.dirname(filePath));
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
  const fileIssues = issues.filter((i: any) => {
    const issuePath = i.file.replace(/\\/g, '/');
    return issuePath === relativePath || issuePath === path.basename(filePath);
  });

  if (fileIssues.length === 0) {
    console.log(pc.green('\n  No vulnerabilities found in this file.\n'));
  } else {
    console.log(`\n  ${pc.bold(`Found ${fileIssues.length} issue(s):`)}\n`);
    fileIssues.forEach((issue: any) => {
      const severity = issue.severity === 'high'
        ? pc.red('HIGH')
        : issue.severity === 'medium'
          ? pc.yellow('MEDIUM')
          : pc.dim('DUMMY');
      const indicator = issue.severity === 'dummy' ? pc.dim('○') : '●';
      console.log(`  ${indicator} ${severity} ${pc.dim('·')} ${issue.type}`);
      console.log(`    ${pc.dim('Line:')}  ${issue.line || '?'}`);
      console.log(`    ${pc.dim('Match:')} ${issue.match.substring(0, 60)}`);
      if (issue.solution) {
        console.log(`    ${pc.dim('Fix:')}   ${pc.green(issue.solution)}`);
      }
      console.log();
    });
  }
}

function buildChoices(dirPath: string): ExplorerChoice[] {
  const choices: ExplorerChoice[] = [];

  // Add "go back" option
  choices.push({
    name: pc.dim('.. (go back)'),
    value: '__BACK__',
  });

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    return choices;
  }

  // Filter out .git and node_modules
  entries = entries.filter(e => e.name !== '.git' && e.name !== 'node_modules');

  // Sort: directories first, then files
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      choices.push({
        name: `${pc.blue('/')}${entry.name}`,
        value: path.join(dirPath, entry.name),
        description: 'folder',
      });
    } else {
      choices.push({
        name: ` ${entry.name}`,
        value: path.join(dirPath, entry.name),
        description: `${(fs.statSync(path.join(dirPath, entry.name)).size / 1024).toFixed(1)} KB`,
      });
    }
  }

  // Add exit option at the end
  choices.push({
    name: pc.dim('Exit explorer'),
    value: '__EXIT__',
  });

  return choices;
}

export async function runExplorer(startDir: string): Promise<void> {
  let currentDir = path.resolve(startDir);
  const baseDir = currentDir;

  console.log(`\n${pc.bold('Git CLI Scanner')} ${pc.dim('· Interactive Explorer')}`);
  console.log(pc.dim('  Use arrow keys to navigate, Enter to select\n'));

  while (true) {
    const choices = buildChoices(currentDir);

    let selected: string;
    try {
      selected = await select({
        message: `${pc.cyan(currentDir)}`,
        choices: choices,
        pageSize: 20,
        loop: false,
      });
    } catch (err: any) {
      // User pressed Ctrl+C
      break;
    }

    if (selected === '__EXIT__') {
      break;
    }

    if (selected === '__BACK__') {
      currentDir = path.dirname(currentDir);
      continue;
    }

    // Check if it's a directory or file
    try {
      const stat = fs.statSync(selected);
      if (stat.isDirectory()) {
        currentDir = selected;
      } else {
        // It's a file - scan it
        await scanFile(selected, baseDir);

        // After showing results, ask what to do next
        const next = await select({
          message: 'What next?',
          choices: [
            { name: 'Continue browsing', value: 'continue' },
            { name: 'Exit explorer', value: 'exit' },
          ],
        });
        if (next === 'exit') break;
      }
    } catch (err) {
      console.log(pc.red(`  Cannot access: ${selected}`));
    }
  }

  console.log(pc.dim('\n  Explorer closed.\n'));
}
