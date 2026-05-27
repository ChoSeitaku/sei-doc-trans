import { describe, it, expect } from 'vitest';
import { configSchema } from '../../config/schema';
import { loadConfig } from '../../config/loader';
import { resolve } from 'node:path';

const FIXTURES = resolve(__dirname, '../fixtures');

describe('configSchema', () => {
  it('should parse a valid config', () => {
    const valid = {
      baseline: 'zh',
      targets: ['en', 'ja'],
      provider: {
        name: 'deepseek',
        model: 'deepseek-chat',
        apiKeyEnv: 'DEEPSEEK_API_KEY',
      },
    };

    const result = configSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should apply defaults for optional fields', () => {
    const minimal = {
      provider: {
        name: 'openai' as const,
        model: 'gpt-4o',
        apiKeyEnv: 'OPENAI_API_KEY',
      },
    };

    const result = configSchema.parse(minimal);
    expect(result.baseline).toBe('zh');
    expect(result.targets).toEqual(['en']);
    expect(result.include).toEqual(['README.md', 'docs/**/*.md']);
    expect(result.cache.enabled).toBe(true);
    expect(result.options.chunkSize).toBe(2000);
    expect(result.options.retry.maxAttempts).toBe(3);
  });

  it('should reject an invalid provider name', () => {
    const invalid = {
      provider: {
        name: 'unknown-provider',
        model: 'foo',
        apiKeyEnv: 'KEY',
      },
    };

    const result = configSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject empty baseline', () => {
    const invalid = {
      baseline: '',
      provider: {
        name: 'deepseek' as const,
        model: 'deepseek-chat',
        apiKeyEnv: 'KEY',
      },
    };

    const result = configSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should require targets array to have at least one item', () => {
    const invalid = {
      targets: [],
      provider: {
        name: 'deepseek' as const,
        model: 'deepseek-chat',
        apiKeyEnv: 'KEY',
      },
    };

    const result = configSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('loadConfig', () => {
  it('should load and parse a valid config file', () => {
    const configPath = resolve(FIXTURES, 'config-valid.yml');
    const config = loadConfig(__dirname, configPath);

    expect(config.baseline).toBe('zh');
    expect(config.targets).toEqual(['en', 'ja', 'ko']);
    expect(config.provider.name).toBe('deepseek');
    expect(config.provider.model).toBe('deepseek-chat');
    expect(config.options.chunkSize).toBe(2000);
  });

  it('should return defaults when config file is missing', () => {
    const config = loadConfig(__dirname, '/nonexistent/file.yml');

    expect(config.baseline).toBe('zh');
    expect(config.targets).toContain('en');
    expect(config.provider.name).toBe('deepseek');
  });

  it('should throw on invalid config', () => {
    const configPath = resolve(FIXTURES, 'config-invalid.yml');

    expect(() => loadConfig(__dirname, configPath)).toThrow('Invalid config');
  });
});
