import { BaseOpenAIProvider } from './base-openai';
import type { ProviderConfig } from '@github-global/core';

export class QwenProvider extends BaseOpenAIProvider {
  readonly name = 'qwen';

  constructor(config: ProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      model: config.model || 'qwen-plus',
    });
  }
}
