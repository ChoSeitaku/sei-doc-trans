import { BaseOpenAIProvider } from './base-openai';
import type { ProviderConfig } from '@github-global/core';

export class ZhipuProvider extends BaseOpenAIProvider {
  readonly name = 'zhipu';

  constructor(config: ProviderConfig) {
    super({
      ...config,
      baseUrl: config.baseUrl ?? 'https://open.bigmodel.cn/api/paas/v4',
      model: config.model || 'glm-4-flash',
    });
  }
}
