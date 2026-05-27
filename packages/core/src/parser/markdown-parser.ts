import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import type { Root, RootContent } from 'mdast';

export interface ParseOptions {
  mdx?: boolean;
  gfm?: boolean;
  frontmatter?: boolean;
}

export function parseMarkdown(text: string, opts: ParseOptions = {}): Root {
  const { mdx = false, gfm = true, frontmatter = true } = opts;

  const pipeline = unified().use(remarkParse);

  if (gfm) pipeline.use(remarkGfm);
  if (frontmatter) pipeline.use(remarkFrontmatter, ['yaml', 'toml']);
  if (mdx) pipeline.use(remarkMdx);

  const root = pipeline.parse(text);

  return root as Root;
}

export function isHeading(node: RootContent): boolean {
  return node.type === 'heading';
}

export function isCode(node: RootContent): boolean {
  return node.type === 'code';
}

export function isInlineCode(node: RootContent): boolean {
  return node.type === 'inlineCode';
}

export function isText(node: RootContent): boolean {
  return node.type === 'text';
}

export function isLink(node: RootContent): boolean {
  return node.type === 'link';
}

export function isImage(node: RootContent): boolean {
  return node.type === 'image';
}

export function isHtml(node: RootContent): boolean {
  return node.type === 'html';
}

export function isMdxJsxFlowElement(node: RootContent): boolean {
  return node.type === 'mdxJsxFlowElement';
}

export function isMdxJsxTextElement(node: RootContent): boolean {
  return node.type === 'mdxJsxTextElement';
}
