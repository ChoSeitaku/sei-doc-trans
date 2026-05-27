import type { Root, RootContent } from 'mdast';
import type { Chunk } from './types';
import { hashContent } from './hash';
import { isHeading } from '../parser/markdown-parser';
import { serializeMarkdown } from '../parser/serialize';

export function chunkAST(root: Root, maxChunkSize: number = 2000): Chunk[] {
  const children = root.children;
  if (children.length === 0) {
    const emptyHash = hashContent('');
    return [{ index: 0, content: '', hash: emptyHash, anchorHeading: null, startOffset: 0, endOffset: 0 }];
  }

  const chunks: Chunk[] = [];
  let currentChildren: RootContent[] = [];
  let currentSize = 0;
  let lastHeading: string | null = null;
  let chunkIndex = 0;
  let startOffset = 0;

  function flush() {
    if (currentChildren.length === 0) return;
    const miniRoot: Root = { type: 'root', children: currentChildren };
    const content = serializeMarkdown(miniRoot, { gfm: true, frontmatter: true });
    // Record endOffset using cumulative offsets if available
    const lastNode = currentChildren[currentChildren.length - 1];
    const endOffset = lastNode?.position?.end?.offset ?? startOffset + content.length;
    const h = hashContent(content);
    chunks.push({ index: chunkIndex++, content, hash: h, anchorHeading: lastHeading, startOffset, endOffset });
    startOffset = endOffset;
    currentChildren = [];
    currentSize = 0;
  }

  function getHeadingText(node: RootContent): string | null {
    if (!isHeading(node)) return null;
    // Extract text from heading children
    const parts: string[] = [];
    for (const child of (node as { children?: { type: string; value?: string }[] }).children ?? []) {
      if (child.type === 'text' && child.value) parts.push(child.value);
      else if (child.type === 'inlineCode' && child.value) parts.push(child.value);
    }
    return parts.join('') || null;
  }

  for (const node of children) {
    const nodeText = serializeNode(node);
    const nodeSize = nodeText.length;

    // Heading: always start a new chunk
    if (isHeading(node)) {
      flush();
      lastHeading = getHeadingText(node);
      currentChildren.push(node);
      currentSize += nodeSize;
      continue;
    }

    // If adding this node would exceed maxChunkSize AND we have content, flush
    if (currentSize > 0 && currentSize + nodeSize > maxChunkSize) {
      flush();
    }

    currentChildren.push(node);
    currentSize += nodeSize;
  }

  // Flush remaining
  flush();

  // If nothing was produced (shouldn't happen), create empty chunk
  if (chunks.length === 0) {
    const emptyHash = hashContent('');
    chunks.push({ index: 0, content: '', hash: emptyHash, anchorHeading: null, startOffset: 0, endOffset: 0 });
  }

  return chunks;
}

function serializeNode(node: RootContent): string {
  const miniRoot: Root = { type: 'root', children: [node] };
  return serializeMarkdown(miniRoot, { gfm: true, frontmatter: false });
}
