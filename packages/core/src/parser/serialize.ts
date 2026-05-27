import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import type { Root } from 'mdast';

export interface SerializeOptions {
  gfm?: boolean;
  frontmatter?: boolean;
  bullet?: '-' | '*' | '+';
  emphasis?: '_' | '*';
  strong?: '_' | '*';
  fences?: boolean;
  ruleRepetition?: number;
}

export function serializeMarkdown(root: Root, opts: SerializeOptions = {}): string {
  const {
    gfm = true,
    frontmatter = true,
    bullet = '-',
    fences = true,
  } = opts;

  const pipeline = unified().use(remarkStringify, {
    bullet,
    fences,
    ruleRepetition: opts.ruleRepetition ?? 3,
  } as any);

  if (gfm) pipeline.use(remarkGfm);
  if (frontmatter) pipeline.use(remarkFrontmatter, ['yaml', 'toml']);

  return pipeline.stringify(root);
}
