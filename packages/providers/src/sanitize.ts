export function sanitizeResponse(text: string): string {
  let result = text.trim();

  // Strip leading code fences if the entire response is wrapped
  if (result.startsWith('```')) {
    const firstNewline = result.indexOf('\n');
    if (firstNewline > 0) {
      result = result.slice(firstNewline + 1);
    }
  }
  if (result.endsWith('```')) {
    result = result.slice(0, -3).trimEnd();
  }

  // Strip common LLM preambles
  const preambles = [
    /^Here is the (?:translated|translation)[^:]*:\s*/i,
    /^Sure,? here(?:'s| is) the (?:translated|translation)[^:]*:\s*/i,
    /^Certainly!?\s*/i,
  ];
  for (const preamble of preambles) {
    result = result.replace(preamble, '');
  }

  return result.trim();
}

export function checkLengthParity(source: string, translated: string): boolean {
  const sourceLen = source.length;
  const translatedLen = translated.length;
  // Translated text should be within 20%-500% of source length
  const ratio = translatedLen / Math.max(sourceLen, 1);
  return ratio >= 0.2 && ratio <= 5.0;
}
