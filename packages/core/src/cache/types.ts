export interface CacheChunkEntry {
  translations: Record<string, string>;
  translatedAt: string;
}

export interface CacheFileEntry {
  fileHash: string;
  chunks: Record<string, CacheChunkEntry>;
}

export interface CacheManifest {
  version: number;
  files: Record<string, CacheFileEntry>;
}
