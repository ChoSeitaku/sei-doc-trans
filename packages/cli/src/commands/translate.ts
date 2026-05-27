import { resolve } from 'node:path';
import { loadConfig } from '@github-global/core';
import { createProvider } from '@github-global/providers';
import { runPipeline, CacheStore } from '@github-global/core';
import { loadGlossary } from '@github-global/core';
import { createLogger } from '@github-global/core';

import { validateEnv } from '../env';
import { createSpinner } from '../ui/progress';
import { success, error, info, heading, divider, kv } from '../ui/output';

export interface TranslateOptions {
  config?: string;
  lang?: string;
  file?: string;
  force?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

export async function translateCommand(opts: TranslateOptions): Promise<void> {
  const repoRoot = resolve('.');
  const logger = createLogger(opts.verbose ? 'debug' : 'info');

  // 1. Load config
  const config = loadConfig(repoRoot, opts.config);
  if (opts.lang) {
    config.targets = [opts.lang];
  }

  // 2. Validate API key
  validateEnv(config.provider.apiKeyEnv);

  // 3. Create provider
  const spinner = createSpinner('Initializing provider...').start();
  const provider = createProvider(config.provider);
  spinner.succeed(`Provider: ${config.provider.name} (${config.provider.model})`);

  // 4. Load cache
  const cache = new CacheStore(resolve(repoRoot, config.cache.path));
  cache.load();

  // 5. Load glossary
  let glossary;
  if (config.options.glossaryPath) {
    glossary = loadGlossary(resolve(repoRoot, config.options.glossaryPath));
  }

  // 6. Run pipeline
  heading(`Translating from ${config.baseline} to ${config.targets.join(', ')}`);
  if (opts.dryRun) {
    info('DRY RUN mode - no LLM calls will be made');
  }

  const results = await runPipeline({
    config,
    provider,
    cache,
    glossary,
    force: opts.force,
    dryRun: opts.dryRun,
    logger,
  });

  // 7. Print summary
  divider();
  heading('Translation Summary');

  let totalFiles = 0;
  let totalNew = 0;
  let totalReused = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalFailures = 0;

  for (const r of results) {
    const status = r.failures.length > 0 ? ' ⚠' : '';
    console.log(`  [${r.lang}]${status}`);
    kv('Files', String(r.filesProcessed));
    kv('New chunks', String(r.chunksNew));
    kv('Reused chunks', String(r.chunksReused));
    if (r.tokensIn > 0) {
      kv('Tokens', `${r.tokensIn.toLocaleString()} in / ${r.tokensOut.toLocaleString()} out`);
    }
    kv('Duration', `${(r.durationMs / 1000).toFixed(1)}s`);
    if (r.failures.length > 0) {
      for (const f of r.failures) {
        error(`  ${f.file} chunk ${f.chunkIndex}: ${f.reason}`);
      }
    }
    console.log('');

    totalFiles += r.filesProcessed;
    totalNew += r.chunksNew;
    totalReused += r.chunksReused;
    totalTokensIn += r.tokensIn;
    totalTokensOut += r.tokensOut;
    totalFailures += r.failures.length;
  }

  divider();
  kv('Total files', String(totalFiles));
  kv('Total new chunks', String(totalNew));
  kv('Total reused chunks', String(totalReused));
  if (totalTokensIn > 0) {
    kv('Total tokens', `${totalTokensIn.toLocaleString()} in / ${totalTokensOut.toLocaleString()} out`);
  }
  kv('Failures', String(totalFailures));

  if (totalFailures === 0) {
    success('All translations completed successfully');
  } else {
    error(`${totalFailures} translation(s) failed - check logs above`);
  }
}
