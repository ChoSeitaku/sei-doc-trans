export interface TranslateOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  glossary?: Record<string, string>;
  context?: string;
}

export interface TranslateResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
}

export interface LLMProvider {
  readonly name: string;
  translate(opts: TranslateOptions): Promise<TranslateResult>;
}
