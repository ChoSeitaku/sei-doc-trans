// Config
export type { Config, ProviderConfig, OptionsConfig, CacheConfig, RetryConfig } from './config/types';
export { defaultConfig } from './config/defaults';
export { configSchema } from './config/schema';
export { loadConfig } from './config/loader';

// Parser
export {
  parseMarkdown,
  isHeading,
  isCode,
  isInlineCode,
  isText,
  isLink,
  isImage,
  isHtml,
  isMdxJsxFlowElement,
  isMdxJsxTextElement,
} from './parser/markdown-parser';
export type { ParseOptions } from './parser/markdown-parser';
export { extractFrontmatter, translateFrontmatterValues } from './parser/frontmatter';
export type { FrontmatterData } from './parser/frontmatter';
export { serializeMarkdown } from './parser/serialize';
export type { SerializeOptions } from './parser/serialize';

// Chunker
export { chunkAST, hashContent } from './chunker';
export type { Chunk } from './chunker/types';

// Placeholder
export {
  extractPlaceholders,
  serializeWithPlaceholders,
  restorePlaceholders,
  detectResidualPlaceholders,
  hasResidualPlaceholders,
} from './placeholder';
export type { PlaceholderMap, PlaceholderEntry, PlaceholderTag } from './placeholder';

// Glossary
export { loadGlossary, lookupGlossary, buildGlossaryPrompt, buildGlossaryMap } from './glossary';
export type { GlossaryEntry, GlossaryMap } from './glossary';

// Validator
export { validateTranslation } from './validator';
export type { ValidationResult, ValidationError } from './validator';

// Cache
export { CacheStore } from './cache';
export type { CacheManifest, CacheFileEntry, CacheChunkEntry } from './cache';

// Git
export { getChangedFiles, getChangedFilesFromBase } from './git';

// Translator
export { runPipeline, runWithConcurrency } from './translator';
export type { TranslationJob, TranslationFailure, PipelineResult, PipelineOptions } from './translator';
export type { LLMProvider, TranslateOptions, TranslateResult } from './translator/provider-types';

// Utilities
export { normalizePath, repoRelativePath, ensureDir, outputPath } from './paths';
export { createLogger } from './logger';
export type { Logger, LogLevel } from './logger';
export { withRetry } from './retry';
export type { RetryOptions } from './retry';
