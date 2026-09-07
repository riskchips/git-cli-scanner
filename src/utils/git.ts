import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitDiff {
  file: string;
  content: string;
}

export async function getStagedDiff(): Promise<GitDiff[]> {
  try {
    // Get list of staged files
    const { stdout: filesOutput } = await execAsync('git diff --cached --name-only');
    const files = filesOutput.trim().split('\n').filter(Boolean);

    if (files.length === 0) {
      return [];
    }

    const diffs: GitDiff[] = [];
    for (const file of files) {
      // Get the diff for each staged file
      const { stdout: diffContent } = await execAsync(`git diff --cached -- "${file}"`);
      diffs.push({ file, content: diffContent });
    }

    return diffs;
  } catch (error) {
    // If not a git repo or no commits yet, this might fail.
    // For a pre-push hook, there are always commits, but we fallback gracefully.
    console.warn('Could not get git diff. Are you in a git repository?');
    return [];
  }
}

export interface CommitDiff {
  commitHash: string;
  diffs: GitDiff[];
}

export async function getHistoryDiffs(options: { since?: string; id?: string; all?: boolean }): Promise<CommitDiff[]> {
  try {
    let cmd = 'git log -p --pretty=format:"---COMMIT:%H---"';
    
    if (options.id) {
      // Validate hash and only fetch that commit
      cmd += ` -1 ${options.id}`;
    } else {
      if (options.all) cmd += ' --all';
      if (options.since) cmd += ` --since="${options.since}"`;
    }

    const { stdout } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50 }); // 50MB buffer for large histories
    if (!stdout.trim()) {
      return [];
    }

    const commits: CommitDiff[] = [];
    let currentCommit: CommitDiff | null = null;
    let currentFile: string | null = null;
    let currentDiff = '';

    const lines = stdout.split('\n');
    for (const line of lines) {
      if (line.startsWith('---COMMIT:')) {
        if (currentFile && currentCommit) {
           currentCommit.diffs.push({ file: currentFile, content: currentDiff });
        }
        currentFile = null;
        currentDiff = '';
        
        const match = line.match(/---COMMIT:([a-f0-9]+)---/);
        if (match) {
          currentCommit = { commitHash: match[1], diffs: [] };
          commits.push(currentCommit);
        }
      } else if (line.startsWith('diff --git a/')) {
        if (currentFile && currentCommit) {
           currentCommit.diffs.push({ file: currentFile, content: currentDiff });
        }
        const parts = line.substring(13).split(' b/');
        if (parts.length > 0) {
          currentFile = parts[0];
        }
        currentDiff = '';
      } else if (currentFile) {
        currentDiff += line + '\n';
      }
    }
    
    if (currentFile && currentCommit) {
       currentCommit.diffs.push({ file: currentFile, content: currentDiff });
    }

    return commits;
  } catch (error: any) {
    if (error.message && error.message.includes('unknown revision')) {
      throw new Error(`Invalid commit hash: ${options.id}`);
    }
    console.warn('Could not retrieve git history diffs. Are you in a git repository?');
    return [];
  }
}
