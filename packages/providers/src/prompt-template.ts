import type { TranslateOptions } from './types';

const LANG_NAMES: Record<string, string> = {
  zh: 'Chinese',
  en: 'English',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
};

export function buildSystemPrompt(opts: TranslateOptions): string {
  const sourceName = LANG_NAMES[opts.sourceLang] ?? opts.sourceLang;
  const targetName = LANG_NAMES[opts.targetLang] ?? opts.targetLang;

  const parts: string[] = [
    `You are a professional translator specializing in technical documentation.`,
    `Translate the following Markdown content from ${sourceName} to ${targetName}.`,
    '',
    'CRITICAL RULES - follow exactly:',
    '1. PRESERVE all placeholders EXACTLY as they appear (e.g. [[CODE_001]], [[IC_001]], [[URL_001]], [[IMG_001]], [[HTML_001]], [[JSX_001]]). Do NOT translate, modify, add spaces to, or remove any placeholder.',
    '2. Preserve ALL Markdown formatting exactly: headings (#), bold (**), italic (_), lists (-/*), tables (|), blockquotes (>), links, images.',
    '3. Translate only natural language text. Do not translate code, URLs, file paths, or technical identifiers.',
    '4. Use natural, fluent, idiomatic target language appropriate for technical documentation.',
    '5. Return ONLY the translated text. Do NOT wrap in code fences, add preambles, or add explanations.',
  ];

  // Glossary injection
  if (opts.glossary && Object.keys(opts.glossary).length > 0) {
    parts.push('');
    parts.push('GLOSSARY - these terms MUST be translated as specified:');
    for (const [source, target] of Object.entries(opts.glossary)) {
      parts.push(`  "${source}" → "${target}"`);
    }
  }

  // Context
  if (opts.context) {
    parts.push('');
    parts.push(`CONTEXT: ${opts.context}`);
  }

  return parts.join('\n');
}

export function buildUserMessage(text: string): string {
  return text;
}
