import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { CacheStore } from '../../cache/cache-store';
import { hashContent } from '../../chunker/hash';

const TEST_DIR = resolve(__dirname, '../fixtures/.test-output');
const TEST_CACHE = resolve(__dirname, '../fixtures/.test-integration-cache.json');

describe('Cache persistence integration', () => {
  afterEach(() => {
    if (existsSync(TEST_CACHE)) unlinkSync(TEST_CACHE);
  });

  it('should persist file and chunk data across store instances', () => {
    // First instance
    const cache1 = new CacheStore(TEST_CACHE);
    cache1.load();

    const fileHash = hashContent('original content');
    cache1.upsertFile('docs/doc.md', fileHash);

    for (let i = 0; i < 5; i++) {
      cache1.upsertChunk('docs/doc.md', hashContent(`chunk-${i}`), 'en', `English chunk ${i}`);
      cache1.upsertChunk('docs/doc.md', hashContent(`chunk-${i}`), 'ja', `Japanese chunk ${i}`);
    }
    cache1.save();

    // Second instance should load all data
    const cache2 = new CacheStore(TEST_CACHE);
    cache2.load();

    expect(cache2.fileHashMatches('docs/doc.md', fileHash)).toBe(true);
    expect(cache2.getStats().files).toBe(1);
    expect(cache2.getStats().chunks).toBe(5);

    // Verify individual translations
    for (let i = 0; i < 5; i++) {
      expect(cache2.lookupChunk('docs/doc.md', hashContent(`chunk-${i}`), 'en')).toBe(
        `English chunk ${i}`,
      );
      expect(cache2.lookupChunk('docs/doc.md', hashContent(`chunk-${i}`), 'ja')).toBe(
        `Japanese chunk ${i}`,
      );
    }
  });

  it('should handle file hash changes correctly', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    const oldHash = hashContent('v1');
    const newHash = hashContent('v2');

    cache.upsertFile('docs/doc.md', oldHash);
    cache.upsertChunk('docs/doc.md', hashContent('chunk1'), 'en', 'Old translation');
    cache.save();

    // Update file hash (simulating source file change)
    cache.upsertFile('docs/doc.md', newHash);

    expect(cache.fileHashMatches('docs/doc.md', newHash)).toBe(true);
    expect(cache.fileHashMatches('docs/doc.md', oldHash)).toBe(false);

    // Chunks should be preserved after hash update
    expect(cache.lookupChunk('docs/doc.md', hashContent('chunk1'), 'en')).toBe('Old translation');
  });

  it('should prune inactive files while preserving active ones', () => {
    const cache = new CacheStore(TEST_CACHE);
    cache.load();

    cache.upsertFile('docs/active.md', hashContent('active'));
    cache.upsertChunk('docs/active.md', hashContent('c1'), 'en', 'Active');
    cache.upsertFile('docs/stale.md', hashContent('stale'));
    cache.upsertChunk('docs/stale.md', hashContent('c2'), 'en', 'Stale');
    cache.save();

    cache.prune(['docs/active.md']);
    cache.save();

    const cache2 = new CacheStore(TEST_CACHE);
    cache2.load();

    expect(cache2.lookupFile('docs/active.md')).toBeDefined();
    expect(cache2.lookupFile('docs/stale.md')).toBeUndefined();
    expect(cache2.lookupChunk('docs/active.md', hashContent('c1'), 'en')).toBe('Active');
  });
});
