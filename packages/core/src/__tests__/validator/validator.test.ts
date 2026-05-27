import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMarkdown } from '../../parser/markdown-parser';
import { validateTranslation } from '../../validator/validator';

const FIXTURES = resolve(__dirname, '../fixtures');
const read = (name: string) => readFileSync(resolve(FIXTURES, name), 'utf-8');

describe('validateTranslation', () => {
  it('should pass for structurally identical translation', () => {
    const text = read('simple.md');
    const root = parseMarkdown(text);
    // Same text = same structure
    const result = validateTranslation(root, text);

    expect(result.passed).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should fail when heading count differs', () => {
    const original = '# Title\n\n## Section A\n\n## Section B\n\nText.';
    const translated = '# Title\n\nText.\n';
    const root = parseMarkdown(original);

    const result = validateTranslation(root, translated);

    // Should have heading_count error
    const headingErrors = result.errors.filter((e) => e.type === 'heading_count');
    expect(headingErrors.length).toBeGreaterThan(0);
  });

  it('should detect residual placeholders', () => {
    const original = '# Title\n\nSome text.';
    const translated = '# Title\n\n[[CODE_001]] in the middle.';
    const root = parseMarkdown(original);

    const result = validateTranslation(root, translated);

    const residualErrors = result.errors.filter((e) => e.type === 'residual_placeholder');
    expect(residualErrors.length).toBeGreaterThan(0);
  });

  it('should fail when code block count differs', () => {
    const original = read('with-code-blocks.md');
    const translated = '# Doc\n\nJust text, no code.';
    const root = parseMarkdown(original);

    const result = validateTranslation(root, translated);

    const codeErrors = result.errors.filter((e) => e.type === 'code_block_count');
    expect(codeErrors.length).toBeGreaterThan(0);
  });

  it('should handle parse failure gracefully', () => {
    const root = parseMarkdown('# Title\n\nText.');
    const result = validateTranslation(root, '[[[unclosed bracket');

    const parseErrors = result.errors.filter((e) => e.type === 'parse_failure');
    // May pass or fail - just verify it doesn't crash
    expect(result).toHaveProperty('passed');
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should detect image count mismatch', () => {
    const original = read('with-links-images.md');
    const translated = '# Doc\n\nNo images here.';
    const root = parseMarkdown(original);

    const result = validateTranslation(root, translated);

    const imageErrors = result.errors.filter((e) => e.type === 'image_count');
    expect(imageErrors.length).toBeGreaterThan(0);
  });
});
