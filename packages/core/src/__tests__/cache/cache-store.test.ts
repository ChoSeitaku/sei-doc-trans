import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { existsSync, unlinkSync, mkdirSync, writeFileSync } from 'node:fs';
import { CacheStore } from '../../cache/cache-store';
import { hashContent } from '../../chunker/hash';

const TEST_CACHE = resolve(__dirname, '../fixtures/.test-cache.json');

describe('CacheStore', () => {
  beforeEach(() => {
    if (existsSync(TEST_CACHE)) unlinkSync(TEST_CACHE);
  });

  afterEach(() => {
    if (existsSync(TEST_CACHE)) unlinkSync(TEST_CACHE);
  });

  it('should start with empty manifest when no file exists', () => {
    const cache = new CacheStore('/nonexistent/path.json');
    cache.load();

    expect(cache.getStats().files).toBe(0);
    expect(cache.getStats().chunks).toBe(0);
  });

  it('should upsert and lookup file entries', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    const fileHash = hashContent('test content');
    cache.upsertFile('docs/test.md', fileHash);

    expect(cache.fileHashMatches('docs/test.md', fileHash)).toBe(true);
    expect(cache.fileHashMatches('docs/test.md', 'different')).toBe(false);
  });

  it('should upsert and lookup chunk translations', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    const fileHash = hashContent('content');
    const chunkHash = hashContent('chunk 1');
    cache.upsertFile('docs/test.md', fileHash);
    cache.upsertChunk('docs/test.md', chunkHash, 'en', 'Translated text');

    const result = cache.lookupChunk('docs/test.md', chunkHash, 'en');
    expect(result).toBe('Translated text');
  });

  it('should return undefined for non-existent chunk', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    const result = cache.lookupChunk('docs/nonexistent.md', 'hash123', 'en');
    expect(result).toBeUndefined();
  });

  it('should save and reload cache', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    const fileHash = hashContent('persist test');
    cache.upsertFile('docs/persist.md', fileHash);
    cache.upsertChunk('docs/persist.md', hashContent('chunk'), 'en', 'Hello');
    cache.save();

    // Reload
    const cache2 = new CacheStore(TEST_CACHE);
    cache2.load();

    const result = cache2.lookupChunk('docs/persist.md', hashContent('chunk'), 'en');
    expect(result).toBe('Hello');
  });

  it('should prune inactive files', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    cache.upsertFile('docs/keep.md', hashContent('keep'));
    cache.upsertFile('docs/remove.md', hashContent('remove'));

    cache.prune(['docs/keep.md']);

    expect(cache.lookupFile('docs/keep.md')).toBeDefined();
    expect(cache.lookupFile('docs/remove.md')).toBeUndefined();
  });

  it('should track stats correctly', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    cache.upsertFile('docs/a.md', hashContent('a'));
    cache.upsertFile('docs/b.md', hashContent('b'));
    cache.upsertChunk('docs/a.md', hashContent('c1'), 'en', 'en text');
    cache.upsertChunk('docs/a.md', hashContent('c2'), 'ja', 'ja text');

    const stats = cache.getStats();
    expect(stats.files).toBe(2);
    expect(stats.chunks).toBe(2);
    expect(stats.langs.get('en')).toBe(1);
    expect(stats.langs.get('ja')).toBe(1);
  });

  it('should handle corrupted cache file gracefully', () => {
    writeFileSync(TEST_CACHE, 'not valid json{', 'utf-8');

    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    // Should default to empty manifest
    expect(cache.getStats().files).toBe(0);
  });

  it('should handle version mismatch gracefully', () => {
    writeFileSync(TEST_CACHE, JSON.stringify({ version: 999, files: {} }), 'utf-8');

    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    // Should reset to empty
    expect(cache.getStats().files).toBe(0);
  });
});
