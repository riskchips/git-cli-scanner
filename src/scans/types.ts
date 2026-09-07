import { GitDiff } from '../utils/git';

export interface ScanIssue {
  type: string;
  file: string;
  line: number;
  match: string;
  severity: 'high' | 'medium' | 'dummy';
  solution: string;
  risk?: string;
  commitHash?: string;
}

export interface Scanner {
  id: string;
  scan(diff: GitDiff): ScanIssue[];
}
