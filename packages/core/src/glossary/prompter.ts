import type { GlossaryMap } from './types';

export function buildGlossaryPrompt(
  glossary: GlossaryMap,
  targetLang: string,
): string {
  if (glossary.size === 0) return '';

  const lines: string[] = [
    'GLOSSARY: The following terms MUST be translated as specified, do not deviate:',
    '',
  ];

  for (const [source, translations] of glossary) {
    const translated = translations[targetLang];
    if (translated) {
      lines.push(`- "${source}" → "${translated}"`);
    }
  }

  if (lines.length <= 2) return '';

  return lines.join('\n');
}

export function buildGlossaryMap(
  glossary: GlossaryMap,
  targetLang: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [source, translations] of glossary) {
    const translated = translations[targetLang];
    if (translated) {
      map[source] = translated;
    }
  }
  return map;
}
