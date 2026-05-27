import OpenAI from 'openai';
import type { LLMProvider, TranslateOptions, TranslateResult } from './types';
import type { ProviderConfig } from '@github-global/core';
import { buildSystemPrompt, buildUserMessage } from './prompt-template';
import { sanitizeResponse } from './sanitize';

export abstract class BaseOpenAIProvider implements LLMProvider {
  abstract readonly name: string;
  protected client: OpenAI;

  constructor(protected config: ProviderConfig) {
    const apiKey = process.env[config.apiKeyEnv];
    if (!apiKey) {
      throw new Error(
        `API key not found. Set environment variable: ${config.apiKeyEnv}`,
      );
    }

    this.client = new OpenAI({
      apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      maxRetries: 0, // We handle retries ourselves
    });
  }

  async translate(opts: TranslateOptions): Promise<TranslateResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: 0.1,
        messages: [
          { role: 'system', content: buildSystemPrompt(opts) },
          { role: 'user', content: buildUserMessage(opts.text) },
        ],
      });

      const text = sanitizeResponse(
        response.choices[0]?.message?.content ?? '',
      );
      const tokensIn = response.usage?.prompt_tokens ?? 0;
      const tokensOut = response.usage?.completion_tokens ?? 0;

      return { text, tokensIn, tokensOut };
    } catch (err) {
      throw new Error(
        `[${this.name}] Translation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
