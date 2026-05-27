import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMarkdown } from '../../parser/markdown-parser';
import { serializeWithPlaceholders } from '../../placeholder/replacer';
import { extractPlaceholders } from '../../placeholder/extractor';
import { restorePlaceholders, detectResidualPlaceholders, hasResidualPlaceholders } from '../../placeholder/restorer';

const FIXTURES = resolve(__dirname, '../fixtures');
const read = (name: string) => readFileSync(resolve(FIXTURES, name), 'utf-8');

describe('extractPlaceholders', () => {
  it('should extract code blocks as CODE placeholders', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const { root: workRoot, map } = extractPlaceholders(root);
    const serialized = serializeWithPlaceholders(workRoot);

    // Code tags should be present
    expect(serialized).toContain('[[CODE_');
    // Original code content should be in the map
    const codeEntries = Array.from(map.values()).filter((e) => e.type === 'CODE');
    expect(codeEntries.length).toBeGreaterThan(0);
    expect(codeEntries.some((e) => e.value.includes('function hello()'))).toBe(true);
  });

  it('should extract inline code as IC placeholders', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const { root: workRoot, map } = extractPlaceholders(root);
    const serialized = serializeWithPlaceholders(workRoot);

    expect(serialized).toContain('[[IC_');
    const icEntries = Array.from(map.values()).filter((e) => e.type === 'IC');
    expect(icEntries.length).toBeGreaterThan(0);
  });

  it('should extract link URLs', () => {
    const text = read('with-links-images.md');
    const root = parseMarkdown(text);
    const { map } = extractPlaceholders(root);

    const urlEntries = Array.from(map.values()).filter((e) => e.type === 'URL');
    expect(urlEntries.length).toBeGreaterThan(0);
    expect(urlEntries.some((e) => e.value === 'https://github.com')).toBe(true);
  });

  it('should extract image URLs and alt text', () => {
    const text = read('with-links-images.md');
    const root = parseMarkdown(text);
    const { map } = extractPlaceholders(root);

    const urlEntries = Array.from(map.values()).filter((e) => e.type === 'URL');
    const imgEntries = Array.from(map.values()).filter((e) => e.type === 'IMG');

    expect(urlEntries.some((e) => e.value.includes('image.png'))).toBe(true);
    expect(imgEntries.length).toBeGreaterThan(0);
  });

  it('should handle empty document', () => {
    const text = read('empty.md');
    const root = parseMarkdown(text);
    const { map } = extractPlaceholders(root);

    expect(map.size).toBe(0);
  });

  it('should produce unique and sequential tags', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const { map } = extractPlaceholders(root);

    const tags = Array.from(map.keys());
    const uniqueTags = new Set(tags);
    expect(uniqueTags.size).toBe(tags.length);
  });
});

describe('restorePlaceholders', () => {
  it('should roundtrip extract-restore correctly for code blocks', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const { root: workRoot, map } = extractPlaceholders(root);
    const serialized = serializeWithPlaceholders(workRoot);
    const restored = restorePlaceholders(serialized, map);

    expect(restored).toContain('function hello()');
    expect(restored).toContain('console.log');
    expect(restored).not.toContain('[[CODE_');
    expect(restored).not.toContain('[[IC_');
  });

  it('should roundtrip extract-restore for links and images', () => {
    const text = read('with-links-images.md');
    const root = parseMarkdown(text);
    const { root: workRoot, map } = extractPlaceholders(root);
    const serialized = serializeWithPlaceholders(workRoot);
    const restored = restorePlaceholders(serialized, map);

    expect(restored).toContain('https://github.com');
    expect(restored).toContain('image.png');
    expect(restored).not.toContain('[[URL_');
    expect(restored).not.toContain('[[IMG_');
  });

  it('should handle empty placeholder map', () => {
    const text = 'Plain text without any special elements.';
    const restored = restorePlaceholders(text, new Map());

    expect(restored).toBe(text);
  });
});

describe('detectResidualPlaceholders', () => {
  it('should detect remaining placeholders', () => {
    const text = 'This text has [[CODE_001]] still in it.';
    const residuals = detectResidualPlaceholders(text);

    expect(residuals.length).toBe(1);
    expect(residuals[0]).toBe('[[CODE_001]]');
  });

  it('should return empty array when no placeholders', () => {
    const text = 'Clean text without any placeholders.';
    const residuals = detectResidualPlaceholders(text);

    expect(residuals.length).toBe(0);
  });

  it('should detect multiple residual placeholders', () => {
    const text = '[[CODE_001]] and [[IC_005]] are remaining.';
    const residuals = detectResidualPlaceholders(text);

    expect(residuals.length).toBe(2);
  });
});

describe('hasResidualPlaceholders', () => {
  it('should return true when placeholders exist', () => {
    expect(hasResidualPlaceholders('text [[CODE_001]] more')).toBe(true);
  });

  it('should return false for clean text', () => {
    expect(hasResidualPlaceholders('clean text')).toBe(false);
  });
});
