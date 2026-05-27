import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { ValidationError } from './types';

export function countHeadings(root: Root): number {
  let count = 0;
  visit(root, 'heading', () => { count++; });
  return count;
}

export function countCodeBlocks(root: Root): number {
  let count = 0;
  visit(root, 'code', () => { count++; });
  return count;
}

export function countLinks(root: Root): number {
  let count = 0;
  visit(root, 'link', () => { count++; });
  return count;
}

export function countImages(root: Root): number {
  let count = 0;
  visit(root, 'image', () => { count++; });
  return count;
}

export function countListItems(root: Root): number {
  let count = 0;
  visit(root, 'listItem', () => { count++; });
  return count;
}

export function runStructuralChecks(
  originalRoot: Root,
  translatedRoot: Root,
): ValidationError[] {
  const errors: ValidationError[] = [];

  const checks: { name: string; fn: (r: Root) => number; type: ValidationError['type'] }[] = [
    { name: 'headings', fn: countHeadings, type: 'heading_count' },
    { name: 'code blocks', fn: countCodeBlocks, type: 'code_block_count' },
    { name: 'links', fn: countLinks, type: 'link_count' },
    { name: 'images', fn: countImages, type: 'image_count' },
    { name: 'list items', fn: countListItems, type: 'list_item_count' },
  ];

  for (const check of checks) {
    const expected = check.fn(originalRoot);
    const actual = check.fn(translatedRoot);
    if (expected !== actual) {
      errors.push({
        type: check.type,
        expected,
        actual,
        detail: `Expected ${expected} ${check.name}, got ${actual}`,
      });
    }
  }

  return errors;
}
