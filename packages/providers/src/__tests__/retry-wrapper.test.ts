import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LLMProvider, TranslateOptions, TranslateResult } from '../types';
import { createRetryingProvider } from '../retry-wrapper';

describe('createRetryingProvider', () => {
  let callCount = 0;

  const makeProvider = (): LLMProvider => ({
    name: 'test',
    async translate(_opts: TranslateOptions): Promise<TranslateResult> {
      callCount++;
      return { text: 'translated', tokensIn: 10, tokensOut: 5 };
    },
  });

  beforeEach(() => {
    callCount = 0;
  });

  it('should delegate successful calls', async () => {
    const provider = createRetryingProvider(makeProvider(), 3, 100);

    const result = await provider.translate({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'zh',
    });

    expect(result.text).toBe('translated');
    expect(callCount).toBe(1);
  });

  it('should retry on rate limit errors', async () => {
    const failingProvider: LLMProvider = {
      name: 'test',
      async translate(_opts: TranslateOptions): Promise<TranslateResult> {
        callCount++;
        if (callCount < 3) {
          throw new Error('429 Too Many Requests');
        }
        return { text: 'ok', tokensIn: 1, tokensOut: 1 };
      },
    };

    const provider = createRetryingProvider(failingProvider, 3, 10);
    const result = await provider.translate({
      text: 'Hi',
      sourceLang: 'en',
      targetLang: 'zh',
    });

    expect(result.text).toBe('ok');
    expect(callCount).toBe(3);
  });

  it('should retry on timeout errors', async () => {
    const failingProvider: LLMProvider = {
      name: 'test',
      async translate(_opts: TranslateOptions): Promise<TranslateResult> {
        callCount++;
        if (callCount < 2) {
          throw new Error('ETIMEDOUT');
        }
        return { text: 'ok', tokensIn: 1, tokensOut: 1 };
      },
    };

    const provider = createRetryingProvider(failingProvider, 3, 10);
    const result = await provider.translate({
      text: 'Hi',
      sourceLang: 'en',
      targetLang: 'zh',
    });

    expect(result.text).toBe('ok');
    expect(callCount).toBe(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const failingProvider: LLMProvider = {
      name: 'test',
      async translate(_opts: TranslateOptions): Promise<TranslateResult> {
        callCount++;
        throw new Error('Invalid API key');
      },
    };

    const provider = createRetryingProvider(failingProvider, 3, 10);

    await expect(
      provider.translate({ text: 'Hi', sourceLang: 'en', targetLang: 'zh' }),
    ).rejects.toThrow('Invalid API key');

    expect(callCount).toBe(1);
  });

  it('should propagate the provider name', () => {
    const provider = createRetryingProvider(makeProvider(), 3, 100);
    expect(provider.name).toBe('test');
  });
});
