import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMarkdown, isHeading, isCode, isLink, isImage } from '../../parser/markdown-parser';
import { extractFrontmatter } from '../../parser/frontmatter';
import { serializeMarkdown } from '../../parser/serialize';

const FIXTURES = resolve(__dirname, '../fixtures');
const read = (name: string) => readFileSync(resolve(FIXTURES, name), 'utf-8');

describe('parseMarkdown', () => {
  it('should parse a simple markdown document', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);

    expect(root.type).toBe('root');
    expect(root.children.length).toBeGreaterThan(0);
  });

  it('should parse headings correctly', () => {
    const text = '# Title\n\n## Section\n\nText.';
    const root = parseMarkdown(text);

    const headings = root.children.filter(isHeading);
    expect(headings.length).toBe(2);
  });

  it('should parse code blocks', () => {
    const text = '```js\nconst x = 1;\n```';
    const root = parseMarkdown(text);

    const codes = root.children.filter(isCode);
    expect(codes.length).toBe(1);
  });

  it('should parse an empty document', () => {
    const text = read('empty.md');
    const root = parseMarkdown(text);

    expect(root.type).toBe('root');
    expect(root.children.length).toBe(0);
  });

  it('should parse GFM tables', () => {
    const text = '| A | B |\n|---|---|\n| 1 | 2 |';
    const root = parseMarkdown(text, { gfm: true });

    expect(root.children.length).toBeGreaterThan(0);
  });
});

describe('extractFrontmatter', () => {
  it('should extract YAML frontmatter', () => {
    const text = read('with-frontmatter.md');
    const root = parseMarkdown(text, { frontmatter: true });
    const { data, contentStart } = extractFrontmatter(root);

    expect(data.title).toBe('My Project');
    expect(data.description).toBe('A sample project for testing');
    expect(data.author).toBe('Test Author');
    expect(contentStart).toBeGreaterThan(0);
  });

  it('should return empty data when no frontmatter', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text, { frontmatter: true });
    const { data, contentStart } = extractFrontmatter(root);

    expect(Object.keys(data).length).toBe(0);
    expect(contentStart).toBe(0);
  });
});

describe('serializeMarkdown', () => {
  it('should roundtrip parse-serialize-parse', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    const serialized = serializeMarkdown(root);

    // Re-parse and verify structure is preserved
    const reparsed = parseMarkdown(serialized);
    const originalHeadings = root.children.filter(isHeading).length;
    const reparsedHeadings = reparsed.children.filter(isHeading).length;

    expect(reparsedHeadings).toBe(originalHeadings);
  });

  it('should preserve code blocks through roundtrip', () => {
    const text = read('with-code-blocks.md');
    const root = parseMarkdown(text);
    const serialized = serializeMarkdown(root);

    const reparsed = parseMarkdown(serialized);
    const originalCodes = root.children.filter(isCode).length;
    const reparsedCodes = reparsed.children.filter(isCode).length;

    expect(reparsedCodes).toBe(originalCodes);
  });

  it('should preserve links', () => {
    const text = read('with-links-images.md');
    const root = parseMarkdown(text);
    const serialized = serializeMarkdown(root);

    // String content should contain the URL
    expect(serialized).toContain('github.com');
  });
});
