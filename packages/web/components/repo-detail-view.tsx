'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { RepoDetail } from '@/lib/api-types';

const LANGS = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ja', name: '日本語', native: 'Japanese' },
  { code: 'ko', name: '한국어', native: 'Korean' },
  { code: 'es', name: 'Español', native: 'Spanish' },
  { code: 'fr', name: 'Français', native: 'French' },
];

const STATUS_LABEL: Record<string, { zh: string; tone: string }> = {
  queued: { zh: '排队', tone: 'border-ink/40 text-ink/60' },
  running: { zh: '排印中', tone: 'border-vermilion text-vermilion' },
  succeeded: { zh: '已出版', tone: 'border-ink text-ink' },
  failed: { zh: '失败', tone: 'border-vermilion bg-vermilion text-paper' },
};

export function RepoDetailView({ initial }: { initial: RepoDetail }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initial.targetLangs);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toggle = (code: string) => {
    setSelected((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
    );
  };

  const submit = async () => {
    if (selected.length === 0) {
      setToast('请至少勾选一种目标语种');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/repos/${initial.owner}/${initial.name}/translate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ targets: selected }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { runId } = (await res.json()) as { runId: string };
      setToast(`译事已派工(${runId}),正在前往译事录`);
      setTimeout(() => router.push('/dashboard/translations'), 1000);
    } catch (e) {
      setToast(e instanceof Error ? e.message : '提交失败');
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <section className="lg:col-span-8">
        <p className="label-kicker mb-3">
          <Link href="/dashboard" className="hover:text-vermilion">
            ← 仓库列表
          </Link>
        </p>

        <div className="flex items-start justify-between gap-6 mb-1">
          <p className="font-mono text-ink/60">{initial.owner} /</p>
        </div>
        <h1 className="font-display font-black text-6xl leading-none mb-3 underline-grow">
          {initial.name}
        </h1>
        <p className="text-ink/75 text-lg leading-relaxed max-w-2xl mb-8 font-body">
          {initial.description}
        </p>

        <div className="rule-double my-8" />

        <h2 className="font-display font-bold text-2xl mb-2">
          指定 · 目标语种
        </h2>
        <p className="text-sm text-ink/60 mb-5">
          选定后,我们将就该仓库内的 Markdown / MDX 文档生成各语种译本,以 PR 形式回到你的仓库。
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {LANGS.map((l, i) => {
            const checked = selected.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => toggle(l.code)}
                className={`relative p-4 border-2 text-left transition-all animate-reveal ${
                  checked
                    ? 'border-vermilion bg-vermilion text-paper'
                    : 'border-ink/30 bg-paper-warm hover:border-ink'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <p className="font-mono text-[10px] mb-1 opacity-70">
                  {l.code.toUpperCase()}
                </p>
                <p className="font-display font-bold text-lg leading-none">
                  {l.name}
                </p>
                <p className="font-latin italic text-xs mt-1 opacity-80">
                  {l.native}
                </p>
                {checked && (
                  <span className="absolute top-2 right-2 font-mono text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-12">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-press btn-press--seal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '派工中…' : '开 印 · 启动翻译'}
            <span className="font-mono text-xs opacity-70">↵</span>
          </button>
          {toast && (
            <p className="text-sm text-vermilion font-body animate-reveal">{toast}</p>
          )}
        </div>

        <h2 className="font-display font-bold text-2xl mb-3">候选文档</h2>
        <p className="text-sm text-ink/60 mb-5">
          匹配 .github-global.yml 中 include/exclude 规则之结果。
        </p>

        <div className="border border-ink/30 bg-paper">
          {initial.candidateFiles.map((f, i) => (
            <div
              key={f.path}
              className={`grid grid-cols-12 gap-4 px-4 py-3 text-sm ${
                i !== initial.candidateFiles.length - 1 ? 'border-b border-ink/15' : ''
              }`}
            >
              <span className="col-span-7 font-mono break-all">{f.path}</span>
              <span className="col-span-2 text-right font-mono text-xs text-ink/60">
                {(f.size / 1024).toFixed(1)} KB
              </span>
              <span className="col-span-3 text-right font-mono text-xs text-ink/60">
                {new Date(f.lastModified).toLocaleDateString('zh-CN')}
              </span>
            </div>
          ))}
        </div>
      </section>

      <aside className="lg:col-span-4">
        <p className="label-kicker mb-3">Repository · Specimen</p>
        <div className="border border-ink/30 p-5 font-mono text-xs space-y-2 bg-paper">
          <p><span className="text-ink/50">id ............ </span>{initial.id}</p>
          <p><span className="text-ink/50">visibility .... </span>{initial.private ? 'private' : 'public'}</p>
          <p><span className="text-ink/50">branch ........ </span>{initial.defaultBranch}</p>
          <p><span className="text-ink/50">baseline ...... </span>{initial.baselineLang}</p>
          <p><span className="text-ink/50">glossary ...... </span>{initial.glossaryCount} 项</p>
          <p><span className="text-ink/50">cache hits .... </span>{initial.cacheHits}</p>
        </div>

        <div className="mt-8">
          <p className="label-kicker mb-3">近期译事</p>
          {initial.recentRuns.length === 0 ? (
            <p className="text-sm text-ink/50 font-body italic">尚无记录。</p>
          ) : (
            <ul className="space-y-3">
              {initial.recentRuns.map((r) => {
                const s = STATUS_LABEL[r.status]!;
                return (
                  <li
                    key={r.id}
                    className="border border-ink/20 p-3 text-xs bg-paper-warm/40"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-mono">{r.id}</span>
                      <span className={`font-mono px-2 py-0.5 border ${s.tone}`}>
                        {s.zh}
                      </span>
                    </div>
                    <p className="font-mono text-ink/60 mb-1">
                      {r.targets.map((t) => t.toUpperCase()).join(' · ')}
                    </p>
                    <p className="font-mono text-ink/60">
                      {new Date(r.startedAt).toLocaleString('zh-CN')}
                    </p>
                    {r.prUrl && (
                      <a
                        href={r.prUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-vermilion underline-grow font-display block mt-2"
                      >
                        查看 Pull Request ↗
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
