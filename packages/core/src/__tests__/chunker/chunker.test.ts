import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMarkdown } from '../../parser/markdown-parser';
import { chunkAST, hashContent } from '../../chunker';

const FIXTURES = resolve(__dirname, '../fixtures');
const read = (name: string) => readFileSync(resolve(FIXTURES, name), 'utf-8');

describe('hashContent', () => {
  it('should produce deterministic hashes', () => {
    const hash1 = hashContent('hello world');
    const hash2 = hashContent('hello world');

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different content', () => {
    const hash1 = hashContent('hello world');
    const hash2 = hashContent('hello world!');

    expect(hash1).not.toBe(hash2);
  });

  it('should produce a valid hex string', () => {
    const hash = hashContent('test');

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('chunkAST', () => {
  it('should chunk a simple document at heading boundaries', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root, 2000);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]!.index).toBe(0);
    expect(chunks.every((c) => c.hash.length === 64)).toBe(true);
  });

  it('should create a single chunk for empty document', () => {
    const text = read('empty.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root);

    expect(chunks.length).toBe(1);
    expect(chunks[0]!.content).toBe('');
  });

  it('should include anchor heading in chunks', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root, 2000);

    // At least one chunk should have a heading anchor
    const hasHeadings = chunks.some((c) => c.anchorHeading !== null);
    expect(hasHeadings).toBe(true);
  });

  it('should enforce max chunk size', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root, 100); // Very small chunk size

    // Should split into more chunks with small size
    expect(chunks.length).toBeGreaterThan(2);
  });

  it('should handle code-only file', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root);

    // Code blocks should be part of chunks
    const allContent = chunks.map((c) => c.content).join('');
    expect(allContent).toContain('```');
  });

  it('should have sequential chunk indices', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    const chunks = chunkAST(root);

    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i]!.index).toBe(i);
    }
  });
});
