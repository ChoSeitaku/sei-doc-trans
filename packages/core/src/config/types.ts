export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
}

export interface ProviderConfig {
  name: 'openai' | 'anthropic' | 'deepseek' | 'qwen' | 'zhipu';
  model: string;
  baseUrl?: string;
  apiKeyEnv: string;
  maxConcurrency: number;
  timeoutMs: number;
}

export interface OptionsConfig {
  chunkSize: number;
  preserveFrontmatterKeys: boolean;
  translateFrontmatterValues: string[];
  glossaryPath: string;
  retry: RetryConfig;
}

export interface CacheConfig {
  path: string;
  enabled: boolean;
}

export interface Config {
  baseline: string;
  targets: string[];
  include: string[];
  exclude: string[];
  output: string;
  outputReadme: string;
  provider: ProviderConfig;
  options: OptionsConfig;
  cache: CacheConfig;
}
