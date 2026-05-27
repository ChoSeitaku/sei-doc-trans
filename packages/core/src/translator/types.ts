import type { Config } from '../config/types';
import type { LLMProvider } from './provider-types';
import type { CacheStore } from '../cache/cache-store';
import type { GlossaryMap } from '../glossary/types';
import type { Logger } from '../logger';

export interface TranslationJob {
  sourceFile: string;
  sourceContent: string;
  targetLang: string;
  outputPath: string;
}

export interface TranslationFailure {
  file: string;
  chunkIndex: number;
  lang: string;
  reason: string;
  detail: string;
}

export interface PipelineResult {
  lang: string;
  filesProcessed: number;
  chunksNew: number;
  chunksReused: number;
  tokensIn: number;
  tokensOut: number;
  failures: TranslationFailure[];
  durationMs: number;
}

export interface PipelineOptions {
  config: Config;
  provider: LLMProvider;
  cache: CacheStore;
  glossary?: GlossaryMap;
  force?: boolean;
  changedFiles?: string[];
  dryRun?: boolean;
  logger?: Logger;
}
