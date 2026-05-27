export interface Chunk {
  index: number;
  content: string;
  hash: string;
  anchorHeading: string | null;
  startOffset: number;
  endOffset: number;
}
