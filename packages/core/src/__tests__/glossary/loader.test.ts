import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { loadGlossary, lookupGlossary } from '../../glossary/loader';
import { buildGlossaryPrompt, buildGlossaryMap } from '../../glossary/prompter';

const FIXTURES = resolve(__dirname, '../fixtures');

describe('loadGlossary', () => {
  it('should load a valid glossary file', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));

    expect(glossary.size).toBe(3);
  });

  it('should extract translations per language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));

    const llm = glossary.get('大模型');
    expect(llm).toBeDefined();
    expect(llm!['en']).toBe('LLM');
    expect(llm!['ja']).toBe('大規模言語モデル');
  });

  it('should return empty map for non-existent file', () => {
    const glossary = loadGlossary('/nonexistent/glossary.yml');

    expect(glossary.size).toBe(0);
  });
});

describe('lookupGlossary', () => {
  it('should find translation for a term', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));

    expect(lookupGlossary(glossary, '大模型', 'en')).toBe('LLM');
    expect(lookupGlossary(glossary, '提示词', 'ja')).toBe('プロンプト');
  });

  it('should return undefined for unknown term', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));

    expect(lookupGlossary(glossary, 'unknown', 'en')).toBeUndefined();
  });

  it('should return undefined for unsupported language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));

    expect(lookupGlossary(glossary, '大模型', 'fr')).toBeUndefined();
  });
});

describe('buildGlossaryPrompt', () => {
  it('should build prompt injection for target language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));
    const prompt = buildGlossaryPrompt(glossary, 'en');

    expect(prompt).toContain('GLOSSARY');
    expect(prompt).toContain('大模型');
    expect(prompt).toContain('LLM');
  });

  it('should return empty string for empty glossary', () => {
    const prompt = buildGlossaryPrompt(new Map(), 'en');

    expect(prompt).toBe('');
  });

  it('should only include terms with translation for target language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));
    const prompt = buildGlossaryPrompt(glossary, 'fr');

    // No terms have French translation
    expect(prompt).toBe('');
  });
});

describe('buildGlossaryMap', () => {
  it('should build a lookup map for a target language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));
    const map = buildGlossaryMap(glossary, 'en');

    expect(map['大模型']).toBe('LLM');
    expect(map['提示词']).toBe('prompt');
    expect(map['智能体']).toBe('agent');
  });

  it('should be empty for unsupported language', () => {
    const glossary = loadGlossary(resolve(FIXTURES, 'glossary.yml'));
    const map = buildGlossaryMap(glossary, 'fr');

    expect(Object.keys(map).length).toBe(0);
  });
});
