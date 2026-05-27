import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserMessage } from '../prompt-template';
import type { TranslateOptions } from '../types';

describe('buildSystemPrompt', () => {
  const baseOpts: TranslateOptions = {
    text: 'Hello',
    sourceLang: 'zh',
    targetLang: 'en',
  };

  it('should include source and target language names', () => {
    const prompt = buildSystemPrompt(baseOpts);

    expect(prompt).toContain('Chinese');
    expect(prompt).toContain('English');
  });

  it('should include critical rules', () => {
    const prompt = buildSystemPrompt(baseOpts);

    expect(prompt).toContain('CRITICAL RULES');
    expect(prompt).toContain('[[CODE_001]]');
    expect(prompt).toContain('placeholders');
  });

  it('should inject glossary when provided', () => {
    const prompt = buildSystemPrompt({
      ...baseOpts,
      glossary: { '大模型': 'LLM', '提示词': 'prompt' },
    });

    expect(prompt).toContain('GLOSSARY');
    expect(prompt).toContain('"大模型" → "LLM"');
    expect(prompt).toContain('"提示词" → "prompt"');
  });

  it('should not include glossary when empty', () => {
    const prompt = buildSystemPrompt({
      ...baseOpts,
      glossary: {},
    });

    expect(prompt).not.toContain('GLOSSARY');
  });

  it('should inject context when provided', () => {
    const prompt = buildSystemPrompt({
      ...baseOpts,
      context: 'This is a README file for a Python library.',
    });

    expect(prompt).toContain('CONTEXT: This is a README file for a Python library.');
  });

  it('should fall back to language codes for unknown languages', () => {
    const prompt = buildSystemPrompt({
      text: 'Hi',
      sourceLang: 'xx',
      targetLang: 'yy',
    });

    expect(prompt).toContain('from xx to yy');
  });
});

describe('buildUserMessage', () => {
  it('should return the input text unchanged', () => {
    expect(buildUserMessage('Hello world')).toBe('Hello world');
  });

  it('should handle markdown text', () => {
    const md = '# Title\n\nSome **bold** text.';
    expect(buildUserMessage(md)).toBe(md);
  });
});
