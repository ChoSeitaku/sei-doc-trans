import type { Root } from 'mdast';
import type { ValidationResult, ValidationError } from './types';
import { runStructuralChecks } from './checks';
import { parseMarkdown } from '../parser/markdown-parser';
import { hasResidualPlaceholders } from '../placeholder/restorer';

export function validateTranslation(
  originalRoot: Root,
  translatedText: string,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check for residual placeholder tokens
  if (hasResidualPlaceholders(translatedText)) {
    errors.push({
      type: 'residual_placeholder',
      expected: 0,
      actual: 'detected',
      detail: 'Translated text contains unresolved placeholder tokens',
    });
  }

  // Parse the translated text and run structural checks
  try {
    const translatedRoot = parseMarkdown(translatedText, {
      gfm: true,
      frontmatter: true,
    });
    const structuralErrors = runStructuralChecks(originalRoot, translatedRoot);
    errors.push(...structuralErrors);
  } catch (err) {
    errors.push({
      type: 'parse_failure',
      expected: 'valid markdown',
      actual: String(err),
      detail: 'Failed to parse translated markdown',
    });
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}
