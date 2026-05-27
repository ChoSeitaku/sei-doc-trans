import { describe, it, expect } from 'vitest';
import { sanitizeResponse, checkLengthParity } from '../sanitize';

describe('sanitizeResponse', () => {
  it('should trim whitespace', () => {
    expect(sanitizeResponse('  hello  ')).toBe('hello');
  });

  it('should strip leading code fences', () => {
    const input = '```\n# Translated Title\n\nSome text.\n```';
    const result = sanitizeResponse(input);
    expect(result).toBe('# Translated Title\n\nSome text.');
  });

  it('should strip code fence with language tag', () => {
    const input = '```markdown\n# Title\n\nText.\n```';
    const result = sanitizeResponse(input);
    expect(result).toBe('# Title\n\nText.');
  });

  it('should strip "Here is the translation" preamble', () => {
    const input = 'Here is the translation:\n# Title\n\nText.';
    const result = sanitizeResponse(input);
    expect(result).toBe('# Title\n\nText.');
  });

  it('should strip "Sure, here is the translated text" preamble', () => {
    const input = "Sure, here's the translated text:\n# Title";
    const result = sanitizeResponse(input);
    expect(result).toBe('# Title');
  });

  it('should strip "Certainly!" preamble', () => {
    const input = 'Certainly! # Title';
    const result = sanitizeResponse(input);
    expect(result).toBe('# Title');
  });

  it('should not modify clean text', () => {
    const text = '# Clean translation\n\nNo artifacts here.';
    expect(sanitizeResponse(text)).toBe(text);
  });
});

describe('checkLengthParity', () => {
  it('should return true for similar length texts', () => {
    expect(checkLengthParity('hello world', '你好世界')).toBe(true);
  });

  it('should return true for translations within 20%-500% range', () => {
    // Source is 100 chars, translated is 80 chars (80%)
    expect(checkLengthParity('a'.repeat(100), 'b'.repeat(80))).toBe(true);
    // Source is 100 chars, translated is 300 chars (300%)
    expect(checkLengthParity('a'.repeat(100), 'b'.repeat(300))).toBe(true);
  });

  it('should return false for extremely short translations', () => {
    expect(checkLengthParity('a'.repeat(100), 'x')).toBe(false);
  });

  it('should return false for extremely long translations', () => {
    expect(checkLengthParity('hello', 'x'.repeat(1000))).toBe(false);
  });

  it('should handle empty source gracefully', () => {
    // Ratio of 9/1 = 900% exceeds the 500% max, so it's flagged as suspicious
    expect(checkLengthParity('', 'some text')).toBe(false);
  });
});
