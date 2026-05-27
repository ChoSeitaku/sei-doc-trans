import { z } from 'zod';

const retryConfigSchema = z.object({
  maxAttempts: z.number().int().min(1).max(10).default(3),
  backoffMs: z.number().int().min(100).max(30000).default(1000),
});

const providerConfigSchema = z.object({
  name: z.enum(['openai', 'anthropic', 'deepseek', 'qwen', 'zhipu']),
  model: z.string().min(1),
  baseUrl: z.string().url().optional(),
  apiKeyEnv: z.string().min(1),
  maxConcurrency: z.number().int().min(1).max(20).default(5),
  timeoutMs: z.number().int().min(1000).max(120000).default(30000),
});

const optionsConfigSchema = z.object({
  chunkSize: z.number().int().min(500).max(8000).default(2000),
  preserveFrontmatterKeys: z.boolean().default(true),
  translateFrontmatterValues: z.array(z.string()).default(['title', 'description']),
  glossaryPath: z.string().default('.github-global/glossary.yml'),
  retry: retryConfigSchema.default({}),
});

const cacheConfigSchema = z.object({
  path: z.string().default('.github-global/cache.json'),
  enabled: z.boolean().default(true),
});

export const configSchema = z.object({
  baseline: z.string().min(1).max(10).default('zh'),
  targets: z.array(z.string().min(1).max(10)).min(1).default(['en']),
  include: z.array(z.string().min(1)).min(1).default(['README.md', 'docs/**/*.md']),
  exclude: z.array(z.string().min(1)).default([]),
  output: z.string().min(1).default('docs/{lang}/{path}'),
  outputReadme: z.string().min(1).default('README.{lang}.md'),
  provider: providerConfigSchema,
  options: optionsConfigSchema.default({}),
  cache: cacheConfigSchema.default({}),
});
