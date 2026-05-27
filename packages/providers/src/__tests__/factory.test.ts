import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ProviderConfig } from '@github-global/core';
import { createProvider } from '../factory';

describe('createProvider', () => {
  const realEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...realEnv };
  });

  afterEach(() => {
    process.env = realEnv;
  });

  const makeConfig = (name: string): ProviderConfig => ({
    name: name as ProviderConfig['name'],
    model: 'test-model',
    apiKeyEnv: 'TEST_API_KEY',
    maxConcurrency: 3,
    timeoutMs: 30000,
  });

  it('should throw for unknown provider', () => {
    expect(() =>
      createProvider({ ...makeConfig('openai'), name: 'unknown' as any }),
    ).toThrow('Unknown provider');
  });

  it('should throw when API key env var is missing', () => {
    delete process.env.TEST_API_KEY;

    expect(() => createProvider(makeConfig('openai'))).toThrow(
      'API key not found',
    );
  });

  it('should create openai provider when API key is set', () => {
    process.env.TEST_API_KEY = 'sk-test-key';

    const provider = createProvider(makeConfig('openai'));
    expect(provider.name).toBe('openai');
  });

  it('should create deepseek provider when API key is set', () => {
    process.env.TEST_API_KEY = 'sk-test-key';

    const provider = createProvider(makeConfig('deepseek'));
    expect(provider.name).toBe('deepseek');
  });

  it('should create qwen provider when API key is set', () => {
    process.env.TEST_API_KEY = 'sk-test-key';

    const provider = createProvider(makeConfig('qwen'));
    expect(provider.name).toBe('qwen');
  });

  it('should create zhipu provider when API key is set', () => {
    process.env.TEST_API_KEY = 'sk-test-key';

    const provider = createProvider(makeConfig('zhipu'));
    expect(provider.name).toBe('zhipu');
  });

  it('should create anthropic provider when API key is set', () => {
    process.env.TEST_API_KEY = 'sk-test-key';

    const provider = createProvider(makeConfig('anthropic'));
    expect(provider.name).toBe('anthropic');
  });
});
