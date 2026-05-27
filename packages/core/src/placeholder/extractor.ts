import type { Root, RootContent, Literal, Link, Image } from 'mdast';
import { visit } from 'unist-util-visit';
import type { PlaceholderMap, PlaceholderTag } from './types';
import { nextTag, resetCounter } from './placeholders';

export function extractPlaceholders(root: Root): { root: Root; map: PlaceholderMap } {
  resetCounter();
  const map: PlaceholderMap = new Map();

  // We work on a copy to avoid mutating the original
  const workRoot = structuredClone(root) as Root;

  visit(workRoot, (node, index, parent) => {
    if (!parent || index === undefined) return;

    // Fenced code blocks
    if (node.type === 'code') {
      const tag = makeEntry(map, 'CODE', (node as Literal).value);
      (node as Literal).value = tag;
      return;
    }

    // Inline code
    if (node.type === 'inlineCode') {
      const tag = makeEntry(map, 'IC', (node as Literal).value);
      (node as Literal).value = tag;
      return;
    }

    // Link URLs
    if (node.type === 'link') {
      const linkNode = node as Link;
      const tag = makeEntry(map, 'URL', linkNode.url);
      linkNode.url = tag;
      // Children (link text) remain translatable
      return;
    }

    // Images
    if (node.type === 'image') {
      const imgNode = node as Image;
      const urlTag = makeEntry(map, 'URL', imgNode.url);
      const altTag = makeEntry(map, 'IMG', imgNode.alt ?? '');
      imgNode.url = urlTag;
      imgNode.alt = altTag;
      return;
    }

    // Raw HTML
    if (node.type === 'html') {
      const tag = makeEntry(map, 'HTML', (node as Literal).value);
      (node as Literal).value = tag;
      return;
    }

    // MDX JSX flow elements (e.g., <Component prop="val">)
    if (node.type === 'mdxJsxFlowElement') {
      const tag = makeEntry(map, 'JSX', serializeNodeSimple(node));
      replaceNode(parent, index, { type: 'html', value: tag } as unknown as RootContent);
      return;
    }

    // MDX JSX text elements (inline JSX)
    if (node.type === 'mdxJsxTextElement') {
      const tag = makeEntry(map, 'JSX', serializeNodeSimple(node));
      replaceNode(parent, index, { type: 'inlineCode', value: tag } as unknown as RootContent);
      return;
    }
  });

  return { root: workRoot, map };
}

function makeEntry(map: PlaceholderMap, type: PlaceholderTag, value: string): string {
  const tag = nextTag(type);
  map.set(tag, { tag, value, type });
  return tag;
}

function replaceNode(parent: Root | RootContent, index: number, newNode: RootContent): void {
  if ('children' in parent && Array.isArray(parent.children)) {
    (parent as { children: RootContent[] }).children[index] = newNode;
  }
}

function serializeNodeSimple(node: RootContent): string {
  // Simplified serialization for JSX nodes
  const n = node as { name?: string; attributes?: { type: string; name: string; value: unknown }[] };
  const name = n.name ?? 'Component';
  const attrs = (n.attributes ?? [])
    .map((a) => {
      if (a.type === 'mdxJsxAttribute' && a.value && typeof a.value === 'object') {
        const v = (a.value as { value?: string }).value ?? '';
        return `${a.name}=${JSON.stringify(v)}`;
      }
      if (a.type === 'mdxJsxAttribute' && typeof a.value === 'string') {
        return `${a.name}=${JSON.stringify(a.value)}`;
      }
      return a.name;
    })
    .join(' ');
  return attrs ? `<${name} ${attrs} />` : `<${name} />`;
}
