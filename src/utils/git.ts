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
