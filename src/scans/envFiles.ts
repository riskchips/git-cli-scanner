import { Scanner, ScanIssue } from './types';
import { GitDiff } from '../utils/git';

export const envFileScanner: Scanner = {
  id: 'banned-files',
  scan(diff: GitDiff): ScanIssue[] {
    const issues: ScanIssue[] = [];
    
    // Check if the file path itself is a problem
    const filename = diff.file.split('/').pop() || '';
    const bannedExtensions = ['.pem', '.key', '.sqlite', '.db', '.log', '.p12', '.pfx', '.crt', '.cer', '.keystore'];
    const isEnvFile = /(^|\/)\.env(\..+)?$/.test(diff.file);
    const isNodeModules = diff.file.startsWith('node_modules/');

    if (isEnvFile || isNodeModules || bannedExtensions.some(ext => diff.file.endsWith(ext))) {
      let isIgnored = false;
      const fs = require('fs');
      const path = require('path');
      
      try {
        const gitIgnorePath = path.join(process.cwd(), '.gitignore');
        if (fs.existsSync(gitIgnorePath)) {
          const gitIgnore = fs.readFileSync(gitIgnorePath, 'utf8');
          if (gitIgnore.includes('.env') || gitIgnore.includes(filename) || gitIgnore.includes(diff.file)) {
            isIgnored = true;
          }
        }
        
        const npmIgnorePath = path.join(process.cwd(), '.npmignore');
        if (fs.existsSync(npmIgnorePath)) {
          const npmIgnore = fs.readFileSync(npmIgnorePath, 'utf8');
          if (npmIgnore.includes('.env') || npmIgnore.includes(filename) || npmIgnore.includes(diff.file)) {
            isIgnored = true;
          }
        }
      } catch (e) {
        // fail silently
      }

      const matchMsg = isIgnored 
        ? `File extension/name matched banned list (but is currently in .gitignore)`
        : `DANGER: ${filename} is NOT in .gitignore or .npmignore!`;
        
      const severity = isIgnored ? 'dummy' : 'medium'; // if it's ignored, downgrade to dummy so it doesn't block but still shows

      issues.push({
        type: 'banned-file-type',
        file: diff.file,
        line: 0,
        match: matchMsg,
        severity: severity,
        solution: `Run 'echo "${filename}" >> .gitignore' to safely ignore this file type moving forward. If it's meant to be a template, rename it to '${filename}.example'.`,
        risk: 'Contains highly sensitive environment variables, database passwords, or SSL certificates that grant instant system access if leaked.'
      });
    }

    return issues;
  }
};
