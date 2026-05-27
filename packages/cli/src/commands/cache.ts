import { resolve } from 'node:path';
import fastGlob from 'fast-glob';
import { loadConfig, CacheStore } from '@github-global/core';
import { createLogger } from '@github-global/core';
import { heading, kv, info, divider } from '../ui/output';

const { globSync } = fastGlob;

export interface CacheOptions {
  config?: string;
}

export async function cacheStatsCommand(opts: CacheOptions): Promise<void> {
  const repoRoot = resolve('.');
  const config = loadConfig(repoRoot, opts.config);

  const cache = new CacheStore(resolve(repoRoot, config.cache.path));
  cache.load();

  const stats = cache.getStats();

  heading('Cache Statistics');
  kv('Cache path', config.cache.path);
  kv('Files cached', String(stats.files));
  kv('Total chunks', String(stats.chunks));
  divider();
  heading('Chunks per language');
  for (const [lang, count] of stats.langs) {
    kv(lang, String(count));
  }
}

export async function cachePruneCommand(opts: CacheOptions): Promise<void> {
  const repoRoot = resolve('.');
  const config = loadConfig(repoRoot, opts.config);

  const logger = createLogger('info');
  const cache = new CacheStore(resolve(repoRoot, config.cache.path));
  cache.load();

  // We need the active file list - use config include glob
  const activeFiles: string[] = [];
  for (const pattern of config.include) {
    const matches = globSync(pattern, { cwd: repoRoot, onlyFiles: true });
    activeFiles.push(...matches);
  }

  const before = cache.getStats().files;
  cache.prune(activeFiles);
  cache.save();
  const after = cache.getStats().files;

  info(`Pruned ${before - after} stale file(s) from cache`);
  kv('Active files', String(after));
}
