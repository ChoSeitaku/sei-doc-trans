#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init';
import { translateCommand } from './commands/translate';
import { cacheStatsCommand, cachePruneCommand } from './commands/cache';

const program = new Command();

program
  .name('github-global')
  .description('AI-powered documentation translation for open source projects')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize github-global in the current repository')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('--config-dir <path>', 'Directory to write config files', '.')
  .action(async (opts) => {
    await initCommand(opts);
  });

program
  .command('translate')
  .description('Translate documentation files')
  .option('-c, --config <path>', 'Path to config file')
  .option('-l, --lang <lang>', 'Only translate to this language')
  .option('-f, --file <glob>', 'Only translate matching files')
  .option('--force', 'Ignore cache and re-translate everything')
  .option('--dry-run', 'Show what would be translated without calling LLM')
  .option('-v, --verbose', 'Show detailed logs including prompts')
  .action(async (opts) => {
    await translateCommand(opts);
  });

const cacheCmd = program
  .command('cache')
  .description('Cache management commands');

cacheCmd
  .command('stats')
  .description('Show cache statistics')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (opts) => {
    await cacheStatsCommand(opts);
  });

cacheCmd
  .command('prune')
  .description('Remove cache entries for deleted files')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (opts) => {
    await cachePruneCommand(opts);
  });

program.parse();
