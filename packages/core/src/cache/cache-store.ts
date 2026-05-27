import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import type { CacheManifest, CacheFileEntry } from './types';
import { createLogger } from '../logger';
import type { Logger } from '../logger';

const CACHE_VERSION = 1;

export class CacheStore {
  private manifest: CacheManifest;
  private dirty = false;
  private logger: Logger;

  constructor(private cachePath: string) {
    this.logger = createLogger('info');
    this.manifest = { version: CACHE_VERSION, files: {} };
  }

  load(): void {
    try {
      if (!existsSync(this.cachePath)) {
        this.manifest = { version: CACHE_VERSION, files: {} };
        return;
      }
      const raw = readFileSync(this.cachePath, 'utf-8');
      const parsed = JSON.parse(raw) as CacheManifest;

      if (!parsed || parsed.version !== CACHE_VERSION) {
        this.logger.warn('Cache version mismatch, starting fresh');
        this.manifest = { version: CACHE_VERSION, files: {} };
        return;
      }

      this.manifest = parsed;
    } catch (err) {
      this.logger.warn('Failed to load cache, starting fresh', { error: String(err) });
      this.manifest = { version: CACHE_VERSION, files: {} };
    }
  }

  save(): void {
    try {
      const dir = dirname(this.cachePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      const tmpPath = this.cachePath + '.tmp';
      writeFileSync(tmpPath, JSON.stringify(this.manifest, null, 2), 'utf-8');
      renameSync(tmpPath, this.cachePath);
      this.dirty = false;
    } catch (err) {
      this.logger.error('Failed to save cache', { error: String(err) });
    }
  }

  lookupFile(filePath: string): CacheFileEntry | undefined {
    return this.manifest.files[filePath];
  }

  lookupChunk(
    filePath: string,
    chunkHash: string,
    targetLang: string,
  ): string | undefined {
    const file = this.manifest.files[filePath];
    if (!file) return undefined;
    const chunk = file.chunks[chunkHash];
    if (!chunk) return undefined;
    return chunk.translations[targetLang];
  }

  fileHashMatches(filePath: string, fileHash: string): boolean {
    const file = this.manifest.files[filePath];
    if (!file) return false;
    return file.fileHash === fileHash;
  }

  upsertFile(filePath: string, fileHash: string): void {
    if (!this.manifest.files[filePath]) {
      this.manifest.files[filePath] = { fileHash, chunks: {} };
    } else {
      this.manifest.files[filePath]!.fileHash = fileHash;
      // Keep existing chunks when updating file hash
    }
    this.dirty = true;
  }

  upsertChunk(
    filePath: string,
    chunkHash: string,
    targetLang: string,
    translation: string,
  ): void {
    if (!this.manifest.files[filePath]) {
      this.manifest.files[filePath] = { fileHash: '', chunks: {} };
    }
    const file = this.manifest.files[filePath]!;
    if (!file.chunks[chunkHash]) {
      file.chunks[chunkHash] = { translations: {}, translatedAt: '' };
    }
    const chunk = file.chunks[chunkHash]!;
    chunk.translations[targetLang] = translation;
    chunk.translatedAt = new Date().toISOString();
    this.dirty = true;
  }

  prune(activeFiles: string[]): void {
    const activeSet = new Set(activeFiles);
    for (const key of Object.keys(this.manifest.files)) {
      if (!activeSet.has(key)) {
        delete this.manifest.files[key];
        this.dirty = true;
      }
    }
  }

  getStats(): { files: number; chunks: number; langs: Map<string, number> } {
    let chunks = 0;
    const langs = new Map<string, number>();
    for (const file of Object.values(this.manifest.files)) {
      for (const chunk of Object.values(file.chunks)) {
        chunks++;
        for (const lang of Object.keys(chunk.translations)) {
          langs.set(lang, (langs.get(lang) ?? 0) + 1);
        }
      }
    }
    return { files: Object.keys(this.manifest.files).length, chunks, langs };
  }

  isDirty(): boolean {
    return this.dirty;
  }
}
