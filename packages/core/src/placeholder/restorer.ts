import type { PlaceholderMap } from './types';
import { PLACEHOLDER_PATTERN } from './placeholders';

export function restorePlaceholders(text: string, map: PlaceholderMap): string {
  // Sort tags by length descending to avoid partial matches ([[CODE_10]] before [[CODE_1]])
  const tags = Array.from(map.keys()).sort((a, b) => b.length - a.length);

  let result = text;

  for (const tag of tags) {
    const entry = map.get(tag);
    if (!entry) continue;
    // Match both [[TAG]] and the markdown-escaped \[\[TAG\]\] form
    // that remark-stringify produces when brackets look like reference links
    const escapedTag = tag
      .replace(/\[/g, '\\\\?\\[')
      .replace(/\]/g, '\\\\?\\]');
    result = result.replace(new RegExp(escapedTag, 'g'), entry.value);
  }

  return result;
}

export function detectResidualPlaceholders(text: string): string[] {
  const matches = text.match(PLACEHOLDER_PATTERN);
  return matches ?? [];
}

export function hasResidualPlaceholders(text: string): boolean {
  PLACEHOLDER_PATTERN.lastIndex = 0;
  return PLACEHOLDER_PATTERN.test(text);
}
