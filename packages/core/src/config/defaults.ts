import type { Config, RetryConfig } from './types';

export const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
};

export const defaultConfig: Config = {
  baseline: 'zh',
  targets: ['en', 'ja', 'ko', 'es', 'fr'],
  include: ['README.md', 'docs/**/*.md', 'docs/**/*.mdx'],
  exclude: ['docs/**/CHANGELOG.md'],
  output: 'docs/{lang}/{path}',
  outputReadme: 'README.{lang}.md',
  provider: {
    name: 'deepseek',
    model: 'deepseek-chat',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    maxConcurrency: 5,
    timeoutMs: 30000,
  },
  options: {
    chunkSize: 2000,
    preserveFrontmatterKeys: true,
    translateFrontmatterValues: ['title', 'description', 'keywords'],
    glossaryPath: '.github-global/glossary.yml',
    retry: { ...DEFAULT_RETRY },
  },
  cache: {
    path: '.github-global/cache.json',
    enabled: true,
  },
};
