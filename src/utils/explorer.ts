import { createPrompt, useState, useKeypress, usePrefix, isEnterKey, isUpKey, isDownKey, usePagination } from '@inquirer/core';
import pc from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';
import { scanDirectory } from '../scanner';

export const explorePrompt = createPrompt<string, { currentDir: string }>(
  (config, done) => {
    const [currentPath, setCurrentPath] = useState(config.currentDir);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scanResult, setScanResult] = useState<any[] | null>(null);
    const [scanningFile, setScanningFile] = useState<string | null>(null);

    const prefix = usePrefix({ status: 'idle' });

    let items: fs.Dirent[] = [];
    try {
      items = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (err) {
      // Handle permission errors
    }

    // Sort: directories first, then files
    items.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const choices = [
      { name: '🔙 Go Back (or press Left Arrow)', type: 'back' },
      ...items.map(i => ({
        name: i.isDirectory() ? `📁 ${i.name}` : `📄 ${i.name}`,
        type: i.isDirectory() ? 'dir' : 'file',
        nameRaw: i.name
      }))
    ];

    useKeypress(async (key, rl) => {
      if (isEnterKey(key) || key.name === 'right') {
        const selected = choices[selectedIndex];
        
        if (selected.type === 'back') {
          setCurrentPath(path.dirname(currentPath));
          setSelectedIndex(0);
          setScanResult(null);
        } else if (selected.type === 'dir') {
          setCurrentPath(path.join(currentPath, selected.nameRaw!));
          setSelectedIndex(0);
          setScanResult(null);
        } else if (selected.type === 'file') {
          // Scan file!
          const fullPath = path.join(currentPath, selected.nameRaw!);
          setScanningFile(fullPath);
          setScanResult(null);
          const issues = await scanDirectory(currentPath); // We'll scan dir but filter for this file below for simplicity
          const fileIssues = issues.filter((i: any) => i.file === path.relative(process.cwd(), fullPath).replace(/\\/g, '/'));
          setScanResult(fileIssues);
          setScanningFile(null);
        }
      } else if (key.name === 'left') {
        setCurrentPath(path.dirname(currentPath));
        setSelectedIndex(0);
        setScanResult(null);
      } else if (isUpKey(key)) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : choices.length - 1));
        setScanResult(null); // Clear results when moving
      } else if (isDownKey(key)) {
        setSelectedIndex((prev) => (prev < choices.length - 1 ? prev + 1 : 0));
        setScanResult(null); // Clear results when moving
      } else if (key.name === 'c' && key.ctrl) {
        done(''); // exit
      }
    });

    const page = usePagination({
      items: choices,
      active: selectedIndex,
      renderItem: ({ item, isActive }) => {
        if (isActive) {
          return pc.cyan(`❯ ${item.name}`);
        }
        return `  ${item.name}`;
      },
      pageSize: 15,
      loop: false
    });

    let message = `${prefix} ${pc.bold('Exploring:')} ${pc.cyan(currentPath)}\n\n${page}`;

    if (scanResult) {
      message += `\n\n${pc.bold('Scan Results for ' + choices[selectedIndex].nameRaw + ':')}\n`;
      if (scanResult.length === 0) {
        message += pc.green('✔ No vulnerabilities found in this file.\n');
      } else {
        scanResult.forEach((issue: any) => {
          message += `  ${issue.severity === 'high' ? pc.red('● HIGH') : issue.severity === 'medium' ? pc.yellow('● MEDIUM') : pc.dim('○ DUMMY')} · ${issue.type}\n`;
          if (issue.solution) {
            message += `    Fix: ${pc.green(issue.solution)}\n`;
          }
        });
      }
    } else if (scanningFile) {
      message += `\n\n${pc.yellow('Scanning...')} (Please wait)\n`;
    }

    return message;
  }
);
