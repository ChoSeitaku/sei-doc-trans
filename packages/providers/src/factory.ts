import type { LLMProvider } from './types';
import type { ProviderConfig } from '@github-global/core';
import { OpenAIProvider } from './openai';
import { DeepSeekProvider } from './deepseek';
import { QwenProvider } from './qwen';
import { ZhipuProvider } from './zhipu';
import { AnthropicProvider } from './anthropic';
import { createRetryingProvider } from './retry-wrapper';

export function createProvider(config: ProviderConfig): LLMProvider {
  let provider: LLMProvider;

  switch (config.name) {
    case 'openai':
      provider = new OpenAIProvider(config);
      break;
    case 'deepseek':
      provider = new DeepSeekProvider(config);
      break;
    case 'qwen':
      provider = new QwenProvider(config);
      break;
    case 'zhipu':
      provider = new ZhipuProvider(config);
      break;
    case 'anthropic':
      provider = new AnthropicProvider(config);
      break;
    default:
      throw new Error(`Unknown provider: ${config.name}`);
  }

  // Wrap with retry logic
  return createRetryingProvider(
    provider,
    config.maxConcurrency > 0 ? 3 : 1, // maxAttempts (3 is default)
    1000,
  );
}
