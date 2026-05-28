import { mockRuns } from '@/lib/mock-data';

const STATUS_META: Record<
  string,
  { zh: string; bg: string; text: string; border: string }
> = {
  queued: { zh: '排队', bg: 'bg-paper-warm', text: 'text-ink', border: 'border-ink/30' },
  running: { zh: '排印中', bg: 'bg-paper', text: 'text-vermilion', border: 'border-vermilion' },
  succeeded: { zh: '已出版', bg: 'bg-ink', text: 'text-paper', border: 'border-ink' },
  failed: { zh: '退稿', bg: 'bg-vermilion', text: 'text-paper', border: 'border-vermilion' },
};

function duration(start: string, end: string | null): string {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const sec = Math.max(1, Math.floor((e - s) / 1000));
  if (sec < 60) return `${sec} 秒`;
  const m = Math.floor(sec / 60);
  return `${m} 分 ${sec % 60} 秒`;
}

export default function TranslationsPage() {
  return (
    <div>
      <p className="label-kicker mb-3">Section C · Press Log</p>
      <h1 className="font-display font-black text-5xl mb-3 underline-grow">
        译 事 录
      </h1>
      <p className="text-ink/70 max-w-2xl mb-10 leading-relaxed">
        每一次翻译,都被登记在册——从派工时刻,到送印产出,再到回到仓库的那一份 PR。
      </p>

      <div className="rule-double mb-8" />

      <div className="space-y-5">
        {mockRuns.map((r, i) => {
          const meta = STATUS_META[r.status]!;
          const progress = r.filesTotal > 0 ? r.filesDone / r.filesTotal : 0;
          return (
            <article
              key={r.id}
              className="grid grid-cols-12 gap-5 border border-ink/20 p-5 bg-paper hover:border-ink/50 transition-all animate-reveal"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="col-span-12 md:col-span-2 flex md:flex-col items-start gap-2 justify-between md:justify-start">
                <span
                  className={`inline-block px-3 py-1 font-mono text-xs uppercase tracking-widest border-2 ${meta.bg} ${meta.text} ${meta.border}`}
                >
                  {meta.zh}
                </span>
                <span className="font-mono text-[10px] text-ink/50">{r.id}</span>
              </div>

              <div className="col-span-12 md:col-span-6">
                <p className="font-mono text-xs text-ink/60 mb-1">
                  {r.repoFullName}
                </p>
                <p className="font-display text-xl font-medium mb-3">
                  ZH → {r.targets.map((t) => t.toUpperCase()).join(' · ')}
                </p>

                <div className="flex items-center gap-3 text-xs text-ink/70 font-mono">
                  <span>
                    {r.filesDone} / {r.filesTotal} 文档
                  </span>
                  <span>·</span>
                  <span>{duration(r.startedAt, r.finishedAt)}</span>
                  <span>·</span>
                  <span>{new Date(r.startedAt).toLocaleString('zh-CN')}</span>
                </div>

                {r.status === 'running' && (
                  <div className="mt-3 h-1 bg-ink/10 relative w-full max-w-sm">
                    <div
                      className="absolute top-0 left-0 h-full bg-vermilion"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}

                {r.error && (
                  <p className="mt-3 text-sm text-vermilion font-body border-l-2 border-vermilion pl-3">
                    {r.error}
                  </p>
                )}
              </div>

              <div className="col-span-12 md:col-span-4 flex md:justify-end items-start">
                {r.prUrl ? (
                  <a
                    href={r.prUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-press text-sm"
                  >
                    查 阅 PR
                    <span className="font-mono text-xs opacity-70">↗</span>
                  </a>
                ) : r.status === 'failed' ? (
                  <span className="font-display text-sm text-ink/40">无产出</span>
                ) : (
                  <span className="font-display text-sm text-ink/40">尚未出版</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
