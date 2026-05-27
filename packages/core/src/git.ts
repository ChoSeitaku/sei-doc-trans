import { execSync } from 'node:child_process';

export function getChangedFiles(repoRoot: string): string[] {
  try {
    const output = execSync('git diff --name-only HEAD~1', {
      cwd: repoRoot,
      encoding: 'utf-8',
      timeout: 10000,
    });
    return output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
  } catch {
    // On first commit or non-git context, return empty list
    return [];
  }
}

export function getChangedFilesFromBase(
  repoRoot: string,
  baseRef: string = 'HEAD~1',
): string[] {
  try {
    const output = execSync(`git diff --name-only ${baseRef}`, {
      cwd: repoRoot,
      encoding: 'utf-8',
      timeout: 10000,
    });
    return output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
  } catch {
    return [];
  }
}
