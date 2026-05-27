import type { LLMProvider, TranslateOptions, TranslateResult } from './types';
import type { ProviderConfig } from '@github-global/core';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserMessage } from './prompt-template';
import { sanitizeResponse } from './sanitize';

export class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  private client: Anthropic;

  constructor(private config: ProviderConfig) {
    const apiKey = process.env[config.apiKeyEnv];
    if (!apiKey) {
      throw new Error(
        `API key not found. Set environment variable: ${config.apiKeyEnv}`,
      );
    }

    this.client = new Anthropic({ apiKey, timeout: config.timeoutMs });
  }

  async translate(opts: TranslateOptions): Promise<TranslateResult> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model || 'claude-sonnet-4-6',
        max_tokens: 4096,
        temperature: 0.1,
        system: buildSystemPrompt(opts),
        messages: [{ role: 'user', content: buildUserMessage(opts.text) }],
      });

      const content = response.content[0];
      const text = sanitizeResponse(
        content?.type === 'text' ? content.text : '',
      );
      const tokensIn = response.usage?.input_tokens ?? 0;
      const tokensOut = response.usage?.output_tokens ?? 0;

      return { text, tokensIn, tokensOut };
    } catch (err) {
      throw new Error(
        `[anthropic] Translation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
