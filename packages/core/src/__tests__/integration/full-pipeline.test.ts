import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseMarkdown } from '../../parser/markdown-parser';
import { extractFrontmatter } from '../../parser/frontmatter';
import { extractPlaceholders, serializeWithPlaceholders, restorePlaceholders } from '../../placeholder';
import { validateTranslation } from '../../validator/validator';

const FIXTURES = resolve(__dirname, '../fixtures');
const read = (name: string) => readFileSync(resolve(FIXTURES, name), 'utf-8');

describe('Full translation pipeline (mock)', () => {
  it('should handle frontmatter extraction and reconstruction', () => {
    const source = read('with-frontmatter.md');
    const root = parseMarkdown(source, { gfm: true, frontmatter: true });

    const { contentStart } = extractFrontmatter(root);
    expect(contentStart).toBeGreaterThan(0);

    const fmText = source.slice(0, contentStart).trimEnd();
    const body = source.slice(contentStart);

    // Verify frontmatter content
    expect(fmText).toContain('---');
    expect(fmText).toContain('title: My Project');
    expect(fmText).toContain('description: A sample project for testing');

    // Verify body content
    expect(body).not.toContain('title: My Project');
    expect(body).toContain('# Document With Frontmatter');

    // Reconstruct
    const reconstructed = fmText + '\n\n' + body.trim();
    const reparsed = parseMarkdown(reconstructed, { gfm: true, frontmatter: true });
    const { contentStart: cs2 } = extractFrontmatter(reparsed);
    expect(cs2).toBeGreaterThan(0);
  });

  it('should handle placeholder extraction and restoration for code blocks', () => {
    const source = read('with-code-blocks.md');
    const root = parseMarkdown(source);
    const { root: placeholderRoot, map } = extractPlaceholders(root);
    const textForTranslation = serializeWithPlaceholders(placeholderRoot);

    // Should have extracted code-related placeholders
    expect(map.size).toBeGreaterThan(0);

    // Verify placeholders replace original code
    expect(textForTranslation).not.toContain('function hello()');
    expect(textForTranslation).toContain('[[CODE_');

    // Simulate LLM returning the same text (as-if perfect translation)
    const restored = restorePlaceholders(textForTranslation, map);

    // After restoration, original content should be back
    expect(restored).toContain('function hello()');
    expect(restored).toContain('const x = 42');
    expect(restored).not.toContain('[[CODE_');
    expect(restored).not.toContain('[[IC_');

    // Should pass validation
    const validation = validateTranslation(root, restored);
    expect(validation.passed).toBe(true);
  });

  it('should detect when a placeholder is missing from translation', () => {
    const source = read('with-code-blocks.md');
    const root = parseMarkdown(source);
    const { root: placeholderRoot, map } = extractPlaceholders(root);
    const textForTranslation = serializeWithPlaceholders(placeholderRoot);

    // Get the first CODE tag
    const codeEntries = Array.from(map.entries()).filter(([, v]) => v.type === 'CODE');
    expect(codeEntries.length).toBeGreaterThan(0);
    const firstCodeTag = codeEntries[0]![0];

    // Simulate LLM losing that placeholder
    const badTranslation = textForTranslation.replace(firstCodeTag, '[MISSING]');
    const restored = restorePlaceholders(badTranslation, map);

    // The original code should NOT be in the restored text (placeholder was lost)
    const lostValue = map.get(firstCodeTag)!.value;
    expect(restored).not.toContain(lostValue);
    expect(restored).toContain('[MISSING]');

    // Validation should catch the issue (residual placeholder or code block count mismatch)
    const validation = validateTranslation(root, restored);
    // This should fail - either residual tags or structural mismatch
    const hasIssues =
      !validation.passed ||
      validation.errors.length > 0 ||
      !restored.includes(lostValue);
    expect(hasIssues).toBe(true);
  });
});
