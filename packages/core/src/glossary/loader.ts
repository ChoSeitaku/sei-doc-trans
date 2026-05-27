import { readFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';
import type { GlossaryMap } from './types';

export function loadGlossary(path: string): GlossaryMap {
  const map: GlossaryMap = new Map();

  let content: string;
  try {
    content = readFileSync(path, 'utf-8');
  } catch {
    return map;
  }

  let entries: unknown;
  try {
    entries = parseYaml(content);
  } catch {
    return map;
  }

  if (!Array.isArray(entries)) return map;

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const source = typeof e.source === 'string' ? e.source : '';
    if (!source) continue;

    const translations: Record<string, string> = {};
    for (const lang of ['en', 'ja', 'ko', 'es', 'fr', 'zh']) {
      if (typeof e[lang] === 'string') {
        translations[lang] = e[lang] as string;
      }
    }

    if (Object.keys(translations).length > 0) {
      map.set(source, translations);
    }
  }

  return map;
}

export function lookupGlossary(
  glossary: GlossaryMap,
  sourceTerm: string,
  targetLang: string,
): string | undefined {
  const entry = glossary.get(sourceTerm);
  if (!entry) return undefined;
  return entry[targetLang];
}
