import { setFailed, info as logInfo, warning as logWarn } from '@actions/core';
import { resolve } from 'node:path';
import { loadConfig, runPipeline, CacheStore, loadGlossary, createLogger } from '@github-global/core';
import { createProvider } from '@github-global/providers';

import { parseInputs } from './inputs';
import { getChangedFiles } from './git';
import { writeJobSummary } from './summary';

async function main(): Promise<void> {
  try {
    const inputs = parseInputs();
    const repoRoot = resolve('.');
    const logger = createLogger('debug'); // verbose in CI for debugging

    // Load config
    logInfo(`Loading config from ${inputs.configPath}`);
    const config = loadConfig(repoRoot, inputs.configPath);

    // Override provider if specified
    if (inputs.provider) {
      config.provider.name = inputs.provider as typeof config.provider.name;
    }

    // Get changed files
    let changedFiles: string[] | undefined;
    if (inputs.onlyChanged) {
      changedFiles = getChangedFiles();
      logInfo(`Changed files: ${changedFiles.length > 0 ? changedFiles.join(', ') : '(none - full run)'}`);
    }

    // Create provider
    logInfo(`Creating provider: ${config.provider.name}`);
    const provider = createProvider(config.provider);

    // Load cache
    const cache = new CacheStore(resolve(repoRoot, config.cache.path));
    cache.load();
    logInfo('Cache loaded');

    // Load glossary
    let glossary;
    if (config.options.glossaryPath) {
      glossary = loadGlossary(resolve(repoRoot, config.options.glossaryPath));
      logInfo('Glossary loaded');
    }

    // Run pipeline
    logInfo(`Starting translation pipeline: ${config.baseline} → ${config.targets.join(', ')}`);
    const results = await runPipeline({
      config,
      provider,
      cache,
      glossary,
      changedFiles,
      logger,
    });

    // Write job summary
    writeJobSummary(results);

    // Check for failures
    const totalFailures = results.reduce((s, r) => s + r.failures.length, 0);
    if (totalFailures > 0) {
      logWarn(`${totalFailures} translation failure(s) occurred`);
      if (inputs.failOnError) {
        setFailed(`${totalFailures} translation failure(s)`);
        return;
      }
    }

    logInfo('Translation pipeline completed successfully');
  } catch (err) {
    setFailed(err instanceof Error ? err.message : String(err));
  }
}

main();
