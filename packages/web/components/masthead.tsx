import Link from 'next/link';
import { Seal } from './seal';

const lunarYear = '己丑年';

export function Masthead({ issue = '20260528' }: { issue?: string }) {
  return (
    <header className="w-full border-b-2 border-ink rule-double bg-paper">
      <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between text-xs label-kicker">
        <span>Vol. 001  ·  {lunarYear}  ·  No. {issue}</span>
        <span className="hidden sm:inline">中文开源 · 通译四海</span>
      </div>
      <div className="max-w-7xl mx-auto px-8 pb-5 pt-1 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <Seal size="sm">译</Seal>
          <div>
            <h1 className="font-display text-3xl font-bold leading-none tracking-tight">
              GitHub <span className="text-vermilion">Global</span>
            </h1>
            <p className="font-latin italic text-sm text-ink/60 mt-1">The Translator&apos;s Press</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-display text-sm">
          <Link href="/dashboard" className="hover:text-vermilion transition-colors">仪 表 盘</Link>
          <Link href="/dashboard/translations" className="hover:text-vermilion transition-colors">译 事 录</Link>
          <a
            href="https://github.com"
            className="hover:text-vermilion transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            源 文 档 ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
