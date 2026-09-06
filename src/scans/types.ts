import { GitDiff } from '../utils/git';

export interface ScanIssue {
  type: string;
  file: string;
  line: number;
  match: string;
}

export interface Scanner {
  id: string;
  scan(diff: GitDiff): ScanIssue[];
}
