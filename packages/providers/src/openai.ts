import { BaseOpenAIProvider } from './base-openai';
import type { ProviderConfig } from '@github-global/core';

export class OpenAIProvider extends BaseOpenAIProvider {
  readonly name = 'openai';

  constructor(config: ProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl ?? 'https://api.openai.com/v1',
      model: config.model || 'gpt-4o',
    });
  }
}
