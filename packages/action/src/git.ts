import { execSync } from 'node:child_process';

export function getChangedFiles(): string[] {
  try {
    const output = execSync('git diff --name-only HEAD~1', {
      encoding: 'utf-8',
      timeout: 10000,
    });
    return output
      .trim()
      .split('\n')
      .filter((f) => f.length > 0);
  } catch {
    // First commit or non-git context
    return [];
  }
}

export function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();
  } catch {
    return 'unknown';
  }
}
