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

// ─── Helpers ────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIndicator(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const risky = ['.env', '.pem', '.key', '.p12', '.pfx', '.crt', '.cer', '.keystore', '.sqlite', '.db'];
  if (risky.includes(ext) || filename.startsWith('.env')) return pc.red('!');
  const code = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go', '.rs', '.java', '.sh', '.bat'];
  if (code.includes(ext)) return pc.cyan('~');
  const config = ['.json', '.yml', '.yaml', '.toml', '.xml', '.ini'];
  if (config.includes(ext)) return pc.yellow('*');
  return ' ';
}

function getRiskTag(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const risky = ['.env', '.pem', '.key', '.p12', '.pfx', '.crt', '.cer', '.keystore', '.sqlite', '.db'];
  if (risky.includes(ext) || filename.startsWith('.env')) return pc.red(' [RISKY]');
  return '';
}

function getModifiedLabel(filePath: string): string {
  try {
    const stat = fs.statSync(filePath);
    const diff = Date.now() - stat.mtimeMs;
    if (diff < 60000) return pc.green('just now');
    if (diff < 3600000) return pc.green(`${Math.floor(diff / 60000)}m ago`);
    if (diff < 86400000) return pc.yellow(`${Math.floor(diff / 3600000)}h ago`);
    if (diff < 604800000) return pc.dim(`${Math.floor(diff / 86400000)}d ago`);
    return pc.dim(stat.mtime.toLocaleDateString());
  } catch {
    return pc.dim('unknown');
  }
}

function countChildren(dirPath: string): { files: number; dirs: number } {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(e => e.name !== '.git' && e.name !== 'node_modules');
    return {
      files: entries.filter(e => e.isFile()).length,
      dirs: entries.filter(e => e.isDirectory()).length,
    };
  } catch {
    return { files: 0, dirs: 0 };
  }
}

function getDirSizeShallow(dirPath: string): number {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(e => e.name !== '.git' && e.name !== 'node_modules');
    for (const entry of entries) {
      if (entry.isFile()) {
        total += fs.statSync(path.join(dirPath, entry.name)).size;
      }
    }
  } catch { /* */ }
  return total;
}

// ─── Banner ─────────────────────────────────────────────────

function printBanner(): void {
  console.log();
  console.log(pc.bold(pc.cyan('  ┌──────────────────────────────────────────────┐')));
  console.log(pc.bold(pc.cyan('  │')) + pc.bold('  Git CLI Scanner · Interactive Explorer        ') + pc.bold(pc.cyan('│')));
  console.log(pc.bold(pc.cyan('  └──────────────────────────────────────────────┘')));
  console.log();
  console.log(pc.dim('  Controls:'));
  console.log(pc.dim('    Up/Down  Navigate       Enter    Select'));
  console.log(pc.dim('    /        Scan folder    Ctrl+C   Exit'));
  console.log();
}

// ─── Directory Header ───────────────────────────────────────

function printDirHeader(dirPath: string): void {
  const children = countChildren(dirPath);
  const totalSize = getDirSizeShallow(dirPath);
  const relativePath = path.relative(process.cwd(), dirPath) || '.';

  console.log(pc.dim('  ──────────────────────────────────────────────'));
  console.log(`  ${pc.bold(pc.cyan(relativePath + '/'))}`);
  console.log(`  ${pc.dim('Files:')} ${children.files}  ${pc.dim('Folders:')} ${children.dirs}  ${pc.dim('Size:')} ${formatSize(totalSize)}`);
  console.log(pc.dim('  ──────────────────────────────────────────────'));
}

// ─── Scan File (Enhanced) ───────────────────────────────────

async function scanFile(filePath: string, baseDir: string): Promise<void> {
  const filename = path.basename(filePath);
  const stat = fs.statSync(filePath);
  const modTime = getModifiedLabel(filePath);

  // File info header
  console.log();
  console.log(pc.dim('  ══════════════════════════════════════════════'));
  console.log(`  ${pc.bold(filename)}${getRiskTag(filename)}`);
  console.log(`    ${pc.dim('Path:')}     ${path.relative(baseDir, filePath).replace(/\\/g, '/')}`);
  console.log(`    ${pc.dim('Size:')}     ${formatSize(stat.size)}`);
  console.log(`    ${pc.dim('Modified:')} ${modTime}`);

  // Count lines
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lineCount = content.split('\n').length;
    console.log(`    ${pc.dim('Lines:')}    ${lineCount}`);
  } catch { /* binary file */ }

  console.log(pc.dim('  ──────────────────────────────────────────────'));
  console.log(`  ${pc.dim('Scanning for vulnerabilities...')}`);
  console.log();

  const issues = await scanDirectory(path.dirname(filePath));
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
  const fileIssues = issues.filter((i: any) => {
    const issuePath = i.file.replace(/\\/g, '/');
    return issuePath === relativePath || issuePath === path.basename(filePath);
  });

  if (fileIssues.length === 0) {
    console.log(pc.green('  [PASS] No vulnerabilities found. File is clean.'));
    console.log();
  } else {
    const highCount = fileIssues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length;
    const medCount = fileIssues.filter((i: any) => i.severity === 'medium').length;
    const dummyCount = fileIssues.filter((i: any) => i.severity === 'dummy').length;

    const parts: string[] = [];
    if (highCount > 0) parts.push(pc.red(`${highCount} high`));
    if (medCount > 0) parts.push(pc.yellow(`${medCount} medium`));
    if (dummyCount > 0) parts.push(pc.dim(`${dummyCount} ignored`));

    console.log(`  ${pc.bold(`[WARN] ${fileIssues.length} issue(s) found:`)} ${parts.join(pc.dim(' / '))}`);
    console.log();

    // Sort by severity
    const severityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, dummy: 1 };
    const sortedIssues = [...fileIssues].sort((a: any, b: any) => {
      return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
    });

    // Group by rule type
    const grouped = new Map<string, any[]>();
    for (const issue of sortedIssues) {
      if (!grouped.has(issue.type)) {
        grouped.set(issue.type, []);
      }
      grouped.get(issue.type)!.push(issue);
    }

    for (const [_type, group] of grouped.entries()) {
      const displayCount = Math.min(group.length, 3);
      for (let i = 0; i < displayCount; i++) {
        const issue = group[i];
        const severity = issue.severity === 'critical'
          ? pc.red(pc.bold('CRITICAL'))
          : issue.severity === 'high'
            ? pc.red('HIGH')
            : issue.severity === 'medium'
              ? pc.yellow('MEDIUM')
              : pc.dim('IGNORED');
        const colorFn = (issue.severity === 'high' || issue.severity === 'critical')
          ? pc.red
          : issue.severity === 'medium' ? pc.yellow : pc.dim;
        const indicator = issue.severity === 'dummy' ? pc.dim('○') : colorFn('●');

        console.log(`  ${indicator} ${severity} ${pc.dim('·')} ${pc.bold(issue.type)}`);
        console.log(`    ${pc.dim('Line:')}  ${issue.line || '?'}`);
        console.log(`    ${pc.dim('Match:')} ${issue.match.substring(0, 60)}`);

        if (issue.risk) {
          console.log(`    ${pc.dim('Risk:')}  ${pc.yellow(issue.risk)}`);
        }

        if (issue.solution) {
          console.log(`    ${pc.dim('Fix:')}   ${pc.green(issue.solution)}`);
        }
        console.log();
      }

      if (group.length > 3) {
        console.log(`    ${pc.cyan(`... and ${group.length - 3} more ${group[0].type} issues`)}\n`);
      }
    }
  }
  console.log(pc.dim('  ══════════════════════════════════════════════'));
}

// ─── Scan Entire Directory ──────────────────────────────────

async function scanEntireDir(dirPath: string): Promise<void> {
  const dirName = path.basename(dirPath) || '.';

  console.log();
  console.log(pc.dim('  ══════════════════════════════════════════════'));
  console.log(`  ${pc.bold('Directory Scan:')} ${pc.cyan(dirName + '/')}`);
  console.log(pc.dim('  ──────────────────────────────────────────────'));
  console.log(`  ${pc.dim('Scanning all files recursively...')}`);
  console.log();

  const issues = await scanDirectory(dirPath);

  if (issues.length === 0) {
    console.log(pc.green('  [PASS] No vulnerabilities found. Directory is clean.'));
  } else {
    const highCount = issues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length;
    const medCount = issues.filter((i: any) => i.severity === 'medium').length;
    const dummyCount = issues.filter((i: any) => i.severity === 'dummy').length;

    const parts: string[] = [];
    if (highCount > 0) parts.push(pc.red(`${highCount} high`));
    if (medCount > 0) parts.push(pc.yellow(`${medCount} medium`));
    if (dummyCount > 0) parts.push(pc.dim(`${dummyCount} ignored`));

    console.log(`  ${pc.bold(`[WARN] ${issues.length} issue(s) found:`)} ${parts.join(pc.dim(' / '))}`);
    console.log();

    // Group by file
    const byFile = new Map<string, any[]>();
    for (const issue of issues) {
      if (!byFile.has(issue.file)) {
        byFile.set(issue.file, []);
      }
      byFile.get(issue.file)!.push(issue);
    }

    for (const [file, fileIssues] of byFile.entries()) {
      const fHigh = fileIssues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length;
      const fDummy = fileIssues.filter((i: any) => i.severity === 'dummy').length;
      const icon = fHigh > 0 ? pc.red('●') : pc.dim('○');
      const countLabel = fHigh > 0
        ? pc.red(`${fHigh} high`)
        : pc.dim(`${fDummy} ignored`);

      console.log(`  ${icon} ${file} ${pc.dim('—')} ${countLabel}`);

      // Show top 2 issues per file
      const top = fileIssues
        .sort((a: any, b: any) => (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0))
        .slice(0, 2);
      for (const issue of top) {
        const colorFn = (issue.severity === 'high' || issue.severity === 'critical')
          ? pc.red : issue.severity === 'medium' ? pc.yellow : pc.dim;
        console.log(`    ${colorFn('└')} ${pc.dim(issue.type)} ${pc.dim('line ' + (issue.line || '?'))}`);
      }
      if (fileIssues.length > 2) {
        console.log(`    ${pc.dim(`  + ${fileIssues.length - 2} more`)}`);
      }
    }
  }
  console.log();
  console.log(pc.dim('  ══════════════════════════════════════════════'));
}

// ─── Build Choices ──────────────────────────────────────────

function buildChoices(dirPath: string): ExplorerChoice[] {
  const choices: ExplorerChoice[] = [];

  choices.push({
    name: pc.dim('  .. (go back)'),
    value: '__BACK__',
  });

  choices.push({
    name: pc.magenta('  [Scan this directory]'),
    value: '__SCAN_DIR__',
  });

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    return choices;
  }

  entries = entries.filter(e => e.name !== '.git' && e.name !== 'node_modules' && e.name !== 'dist');

  // Sort: directories first, then files
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const children = countChildren(fullPath);
      const desc = `${children.files} files, ${children.dirs} folders`;
      choices.push({
        name: `${pc.blue('/')}${pc.bold(entry.name)}`,
        value: fullPath,
        description: desc,
      });
    } else {
      try {
        const stat = fs.statSync(fullPath);
        const size = formatSize(stat.size);
        const modified = getModifiedLabel(fullPath);
        const indicator = getFileIndicator(entry.name);
        const risk = getRiskTag(entry.name);
        choices.push({
          name: `${indicator} ${entry.name}${risk}`,
          value: fullPath,
          description: `${size} · ${modified}`,
        });
      } catch {
        choices.push({
          name: `  ${entry.name}`,
          value: fullPath,
        });
      }
    }
  }

  choices.push({
    name: pc.dim('  [Exit]'),
    value: '__EXIT__',
  });

  return choices;
}

// ─── Main Explorer Loop ─────────────────────────────────────

export async function runExplorer(startDir: string): Promise<void> {
  let currentDir = path.resolve(startDir);
  const baseDir = currentDir;

  printBanner();

  while (true) {
    printDirHeader(currentDir);
    const choices = buildChoices(currentDir);

    let selected: string;
    try {
      selected = await select({
        message: pc.cyan('Select'),
        choices: choices,
        pageSize: 25,
        loop: false,
      });
    } catch (err: any) {
      break;
    }

    if (selected === '__EXIT__') break;

    if (selected === '__BACK__') {
      currentDir = path.dirname(currentDir);
      continue;
    }

    if (selected === '__SCAN_DIR__') {
      await scanEntireDir(currentDir);
      try {
        const next = await select({
          message: pc.dim('What next?'),
          choices: [
            { name: 'Continue browsing', value: 'continue' },
            { name: 'Exit', value: 'exit' },
          ],
        });
        if (next === 'exit') break;
      } catch { break; }
      continue;
    }

    try {
      const stat = fs.statSync(selected);
      if (stat.isDirectory()) {
        currentDir = selected;
      } else {
        await scanFile(selected, baseDir);
        try {
          const next = await select({
            message: pc.dim('What next?'),
            choices: [
              { name: 'Continue browsing', value: 'continue' },
              { name: 'Rescan this file', value: 'rescan' },
              { name: 'Exit', value: 'exit' },
            ],
          });
          if (next === 'exit') break;
          if (next === 'rescan') {
            await scanFile(selected, baseDir);
            const again = await select({
              message: pc.dim('What next?'),
              choices: [
                { name: 'Continue browsing', value: 'continue' },
                { name: 'Exit', value: 'exit' },
              ],
            });
            if (again === 'exit') break;
          }
        } catch { break; }
      }
    } catch (err) {
      console.log(pc.red(`  Cannot access: ${selected}`));
    }
  }

  console.log(pc.dim('\n  Explorer closed.\n'));
}
