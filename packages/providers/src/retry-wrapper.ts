import type { LLMProvider, TranslateOptions, TranslateResult } from './types';
import { withRetry } from '@github-global/core';

export function createRetryingProvider(
  provider: LLMProvider,
  maxAttempts: number = 3,
  backoffMs: number = 1000,
): LLMProvider {
  return {
    name: provider.name,
    async translate(opts: TranslateOptions): Promise<TranslateResult> {
      return withRetry(() => provider.translate(opts), {
        maxAttempts,
        backoffMs,
        jitter: true,
        shouldRetry: (err) => {
          // Retry on rate limits and transient errors
          const msg = err instanceof Error ? err.message : String(err);
          return (
            msg.includes('429') ||
            msg.includes('rate') ||
            msg.includes('timeout') ||
            msg.includes('5xx') ||
            msg.includes('503') ||
            msg.includes('502') ||
            msg.includes('ECONNRESET') ||
            msg.includes('ETIMEDOUT')
          );
        },
      });
    },
  };
}
