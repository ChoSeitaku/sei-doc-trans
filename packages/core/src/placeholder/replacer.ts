import type { Root } from 'mdast';
import { serializeMarkdown } from '../parser/serialize';

export function serializeWithPlaceholders(root: Root): string {
  return serializeMarkdown(root, {
    gfm: true,
    frontmatter: true,
  });
}
