export type PlaceholderTag = 'CODE' | 'IC' | 'URL' | 'IMG' | 'HTML' | 'JSX';

export interface PlaceholderEntry {
  tag: string;
  value: string;
  type: PlaceholderTag;
}

export type PlaceholderMap = Map<string, PlaceholderEntry>;
