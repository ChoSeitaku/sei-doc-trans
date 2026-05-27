import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import fastGlob from 'fast-glob';
import * as mm from 'minimatch';

const { globSync } = fastGlob;
const { minimatch } = mm;

import type { Config } from '../config/types';
import type { LLMProvider } from './provider-types';
import type { Logger } from '../logger';
import type { GlossaryMap } from '../glossary/types';
import type { PipelineOptions, PipelineResult, TranslationFailure } from './types';

import { parseMarkdown } from '../parser/markdown-parser';
import { extractFrontmatter } from '../parser/frontmatter';
import { chunkAST } from '../chunker/chunker';
import { hashContent } from '../chunker/hash';
import { extractPlaceholders, serializeWithPlaceholders, restorePlaceholders } from '../placeholder';
import { buildGlossaryMap } from '../glossary/prompter';
import { validateTranslation } from '../validator/validator';
import { CacheStore } from '../cache/cache-store';
import { outputPath, normalizePath, repoRelativePath } from '../paths';
import { createLogger } from '../logger';
import { runWithConcurrency } from './concurrency';

export async function runPipeline(opts: PipelineOptions): Promise<PipelineResult[]> {
  const {
    config,
    provider,
    cache,
    glossary,
    force = false,
    changedFiles,
    dryRun = false,
    logger = createLogger('info'),
  } = opts;

  const results: PipelineResult[] = [];

  // 1. Glob source files
  const sourceFiles = globSourceFiles(config, resolve('.'));

  // 2. Filter by changed files if provided
  const filesToProcess = filterFiles(sourceFiles, changedFiles, logger);

  logger.info(`Processing ${filesToProcess.length} source files for ${config.targets.length} languages`);

  // 3. Process each target language in parallel
  await runWithConcurrency(
    config.targets,
    async (targetLang) => {
      const langResult = await processLanguage(
        targetLang,
        filesToProcess,
        config,
        provider,
        cache,
        glossary,
        force,
        dryRun,
        logger,
      );
      results.push(langResult);
    },
    config.targets.length,
  );

  // 4. Save cache
  cache.save();

  return results;
}

async function processLanguage(
  targetLang: string,
  files: { relativePath: string; absolutePath: string }[],
  config: Config,
  provider: LLMProvider,
  cache: CacheStore,
  glossary: GlossaryMap | undefined,
  force: boolean,
  dryRun: boolean,
  logger: Logger,
): Promise<PipelineResult> {
  const startTime = Date.now();
  let filesProcessed = 0;
  let chunksNew = 0;
  let chunksReused = 0;
  let tokensIn = 0;
  let tokensOut = 0;
  const failures: TranslationFailure[] = [];

  const glossaryMap = glossary
    ? buildGlossaryMap(glossary, targetLang)
    : undefined;

  for (const file of files) {
    try {
      const sourceContent = readFileSync(file.absolutePath, 'utf-8');
      const fileHash = hashContent(sourceContent);

      // File-level cache check
      if (!force && cache.fileHashMatches(file.relativePath, fileHash)) {
        logger.debug(`[${targetLang}] Cache hit for ${file.relativePath}, skipping`);
        filesProcessed++;
        chunksReused += countChunksInCache(cache, file.relativePath, targetLang);
        continue;
      }

      // Update file hash in cache
      cache.upsertFile(file.relativePath, fileHash);

      // Process the file
      const result = await translateFile(
        sourceContent,
        file.relativePath,
        targetLang,
        config,
        provider,
        cache,
        glossaryMap,
        force,
        dryRun,
        logger,
      );

      filesProcessed++;
      chunksNew += result.chunksNew;
      chunksReused += result.chunksReused;
      tokensIn += result.tokensIn;
      tokensOut += result.tokensOut;
      failures.push(...result.failures);

      // Write output
      if (!dryRun && result.translatedContent) {
        const outPath = computeOutputPath(file.relativePath, targetLang, config);
        writeOutputFile(outPath, result.translatedContent, logger);
      }
    } catch (err) {
      logger.error(`[${targetLang}] Failed to process ${file.relativePath}: ${String(err)}`);
      failures.push({
        file: file.relativePath,
        chunkIndex: -1,
        lang: targetLang,
        reason: 'file_error',
        detail: String(err),
      });
    }
  }

  return {
    lang: targetLang,
    filesProcessed,
    chunksNew,
    chunksReused,
    tokensIn,
    tokensOut,
    failures,
    durationMs: Date.now() - startTime,
  };
}

async function translateFile(
  sourceContent: string,
  relativePath: string,
  targetLang: string,
  config: Config,
  provider: LLMProvider,
  cache: CacheStore,
  glossaryMap: Record<string, string> | undefined,
  force: boolean,
  dryRun: boolean,
  logger: Logger,
): Promise<{
  translatedContent: string | null;
  chunksNew: number;
  chunksReused: number;
  tokensIn: number;
  tokensOut: number;
  failures: TranslationFailure[];
}> {
  let chunksNew = 0;
  let chunksReused = 0;
  let tokensIn = 0;
  let tokensOut = 0;
  const failures: TranslationFailure[] = [];

  // Parse
  const root = parseMarkdown(sourceContent, { gfm: true, frontmatter: true });

  // Extract frontmatter
  const { contentStart } = extractFrontmatter(root);

  // Extract frontmatter body (content after frontmatter)
  const bodyOnly = sourceContent.slice(contentStart);

  // Parse body for chunking
  const bodyRoot = parseMarkdown(bodyOnly, { gfm: true, frontmatter: false });

  // Chunk
  const chunks = chunkAST(bodyRoot, config.options.chunkSize);

  const translatedChunks: string[] = [];

  // Process each chunk
  for (const chunk of chunks) {
    const cacheHit = !force
      ? cache.lookupChunk(relativePath, chunk.hash, targetLang)
      : undefined;

    if (cacheHit) {
      translatedChunks.push(cacheHit);
      chunksReused++;
      continue;
    }

    if (dryRun) {
      translatedChunks.push(chunk.content);
      chunksNew++;
      continue;
    }

    // Translate the chunk
    try {
      // Extract placeholders
      const chunkRoot = parseMarkdown(chunk.content, { gfm: true, frontmatter: false });
      const { root: placeholderRoot, map } = extractPlaceholders(chunkRoot);
      const textWithPlaceholders = serializeWithPlaceholders(placeholderRoot);

      // Call LLM
      const translateResult = await provider.translate({
        text: textWithPlaceholders,
        sourceLang: config.baseline,
        targetLang,
        glossary: glossaryMap,
        context: chunk.anchorHeading
          ? `This section is about: ${chunk.anchorHeading}`
          : undefined,
      });

      // Restore placeholders
      const restored = restorePlaceholders(translateResult.text, map);

      // Validate
      const validation = validateTranslation(chunkRoot, restored);

      if (!validation.passed) {
        const errorDetail = validation.errors.map((e) => e.detail).join('; ');
        logger.warn(
          `[${targetLang}] Validation failed for chunk ${chunk.index} in ${relativePath}: ${errorDetail}`,
        );

        // Fall back to cached or original
        const fallback = cache.lookupChunk(relativePath, chunk.hash, targetLang) ?? chunk.content;
        translatedChunks.push(fallback);
        failures.push({
          file: relativePath,
          chunkIndex: chunk.index,
          lang: targetLang,
          reason: 'validation_failed',
          detail: errorDetail,
        });
        chunksReused++;
      } else {
        translatedChunks.push(restored);
        cache.upsertChunk(relativePath, chunk.hash, targetLang, restored);
        chunksNew++;
        tokensIn += translateResult.tokensIn;
        tokensOut += translateResult.tokensOut;
      }
    } catch (err) {
      logger.error(
        `[${targetLang}] LLM call failed for chunk ${chunk.index} in ${relativePath}: ${String(err)}`,
      );
      const fallback = cache.lookupChunk(relativePath, chunk.hash, targetLang) ?? chunk.content;
      translatedChunks.push(fallback);
      failures.push({
        file: relativePath,
        chunkIndex: chunk.index,
        lang: targetLang,
        reason: 'llm_error',
        detail: String(err),
      });
      chunksReused++;
    }
  }

  // Rebuild: frontmatter + translated body
  const translatedBody = translatedChunks.join('\n\n');
  let translatedContent: string;
  if (contentStart > 0) {
    const fmText = sourceContent.slice(0, contentStart).trimEnd();
    translatedContent = fmText + '\n\n' + translatedBody;
  } else {
    translatedContent = translatedBody;
  }

  return { translatedContent, chunksNew, chunksReused, tokensIn, tokensOut, failures };
}

// --- Helpers ---

function globSourceFiles(
  config: Config,
  repoRoot: string,
): { relativePath: string; absolutePath: string }[] {
  const files: { relativePath: string; absolutePath: string }[] = [];

  for (const pattern of config.include) {
    const matches = globSync(pattern, {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
      ignore: config.exclude,
    });

    for (const absPath of matches) {
      const relPath = repoRelativePath(absPath, repoRoot);
      files.push({ relativePath: relPath, absolutePath: normalizePath(absPath) });
    }
  }

  return files;
}

function filterFiles(
  files: { relativePath: string; absolutePath: string }[],
  changedFiles: string[] | undefined,
  logger: Logger,
): { relativePath: string; absolutePath: string }[] {
  if (!changedFiles || changedFiles.length === 0) return files;

  const result = files.filter((f) =>
    changedFiles.some((cf) => {
      const match = minimatch(cf, f.relativePath) || cf === f.relativePath || cf.endsWith(f.relativePath);
      return match;
    }),
  );

  logger.info(`Filtered to ${result.length} changed files (from ${files.length} total)`);
  return result;
}

function countChunksInCache(
  cache: CacheStore,
  filePath: string,
  targetLang: string,
): number {
  const file = cache.lookupFile(filePath);
  if (!file) return 0;
  let count = 0;
  for (const chunk of Object.values(file.chunks)) {
    if (chunk.translations[targetLang]) count++;
  }
  return count;
}

function computeOutputPath(
  relativePath: string,
  targetLang: string,
  config: Config,
): string {
  // Handle README specially
  if (relativePath === 'README.md' || relativePath.endsWith('/README.md')) {
    const dir = relativePath === 'README.md' ? '' : dirname(relativePath);
    const readmeOutput = config.outputReadme.replace('{lang}', targetLang);
    return dir ? `${dir}/${readmeOutput}` : readmeOutput;
  }

  return outputPath(config.output, targetLang, relativePath);
}

function writeOutputFile(
  outPath: string,
  content: string,
  logger: Logger,
): void {
  const dir = dirname(outPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(outPath, content, 'utf-8');
  logger.debug(`Wrote ${outPath}`);
}
