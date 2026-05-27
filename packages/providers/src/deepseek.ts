import { BaseOpenAIProvider } from './base-openai';
import type { ProviderConfig } from '@github-global/core';

export class DeepSeekProvider extends BaseOpenAIProvider {
  readonly name = 'deepseek';

  constructor(config: ProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl ?? 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat',
    });
  }
}
