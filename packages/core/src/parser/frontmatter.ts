import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { load as parseYaml } from 'js-yaml';
import type { Literal } from 'mdast';

export interface FrontmatterData {
  [key: string]: unknown;
}

export function extractFrontmatter(
  root: Root,
): { data: FrontmatterData; contentStart: number } {
  let data: FrontmatterData = {};
  let contentStart = 0;

  visit(root, 'yaml', (node) => {
    try {
      const parsed = parseYaml((node as Literal).value) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        data = parsed as FrontmatterData;
      }
    } catch {
      // Invalid YAML, leave data empty
    }
    contentStart = (node.position?.end?.offset ?? 0) + 1;
    return false; // stop after first yaml node
  });

  return { data, contentStart };
}

export function translateFrontmatterValues(
  data: FrontmatterData,
  keysToTranslate: string[],
  translations: Record<string, string>,
): FrontmatterData {
  const result = { ...data };
  for (const key of keysToTranslate) {
    if (typeof result[key] === 'string' && translations[key]) {
      result[key] = translations[key];
    }
  }
  return result;
}
