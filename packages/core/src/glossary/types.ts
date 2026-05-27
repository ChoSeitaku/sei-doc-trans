export interface GlossaryEntry {
  source: string;
  zh?: string;
  en?: string;
  ja?: string;
  ko?: string;
  es?: string;
  fr?: string;
  context?: string;
}

export type GlossaryMap = Map<string, Record<string, string>>;
