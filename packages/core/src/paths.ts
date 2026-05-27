const BACKSLASH = /\\/g;

export function normalizePath(p: string): string {
  return p.replace(BACKSLASH, '/');
}

export function repoRelativePath(absPath: string, root: string): string {
  const normAbs = normalizePath(absPath);
  const normRoot = normalizePath(root);
  if (normAbs.startsWith(normRoot)) {
    const rel = normAbs.slice(normRoot.length);
    return rel.startsWith('/') ? rel.slice(1) : rel;
  }
  return normAbs;
}

export function ensureDir(p: string): string {
  return normalizePath(p).replace(/\/$/, '');
}

export function outputPath(
  template: string,
  lang: string,
  relativePath: string,
): string {
  return normalizePath(
    template.replace('{lang}', lang).replace('{path}', relativePath),
  );
}
