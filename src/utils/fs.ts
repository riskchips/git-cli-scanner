import * as fs from 'fs';
import * as path from 'path';

export interface FileData {
  file: string;
  content: string;
}

export function walkDirectory(dir: string, baseDir: string = dir): FileData[] {
  let results: FileData[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    
    // Ignore common noisy/binary directories
    if (file === '.git' || file === 'node_modules' || file === 'dist' || file === 'build') {
      continue;
    }

    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(walkDirectory(fullPath, baseDir));
    } else {
      // Basic check to skip non-text files based on extension can be added here if needed,
      // but reading them safely is enough for basic scanning.
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // We return relative paths to match git diff behavior
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        results.push({ file: relativePath, content });
      } catch (err) {
        // Skip binary or unreadable files
      }
    }
  }

  return results;
}
