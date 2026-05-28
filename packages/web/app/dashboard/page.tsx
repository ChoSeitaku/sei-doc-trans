import Link from 'next/link';
import { mockRepos, mockRuns } from '@/lib/mock-data';
import { Seal } from '@/components/seal';

const LANG_LABEL: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
};

function timeAgo(iso: string | null) {
  if (!iso) return '尚未译';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

export default function DashboardPage() {
  const installed = mockRepos.filter((r) => r.installed);
  const uninstalled = mockRepos.filter((r) => !r.installed);
  const activeRun = mockRuns.find((r) => r.status === 'running');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <section className="lg:col-span-9">
        <div className="flex items-end justify-between mb-1">
          <p className="label-kicker">Section A · Repositories</p>
          <p className="font-mono text-xs text-ink/60">
            共 {installed.length} 个已签约仓库
          </p>
        </div>
        <h2 className="font-display font-black text-5xl mb-2 underline-grow">
          签 约 仓 库
        </h2>
        <p className="text-ink/70 max-w-xl mb-10 leading-relaxed">
          这是已安装 GitHub Global App 的仓库一览。点击进入,可指定目标语种、查看历次译稿、追踪当前译事。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {installed.map((r, i) => (
            <Link
              key={r.id}
              href={`/dashboard/repos/${r.owner}/${r.name}`}
              className="clipping animate-reveal block"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-ink/60">{r.owner}/</p>
                  <h3 className="font-display font-bold text-2xl leading-tight">
                    {r.name}
                  </h3>
                </div>
                {r.private && (
                  <span className="font-mono text-[10px] uppercase tracking-widest border border-ink/40 px-2 py-0.5">
                    Private
                  </span>
                )}
              </div>

              <p className="text-sm text-ink/70 leading-relaxed mb-4 line-clamp-2">
                {r.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="font-mono text-[10px] px-2 py-0.5 bg-ink text-paper">
                  ZH →
                </span>
                {r.targetLangs.length > 0 ? (
                  r.targetLangs.map((l) => (
                    <span
                      key={l}
                      className="font-mono text-[10px] px-2 py-0.5 border border-ink/40"
                    >
                      {l.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-[10px] text-ink/40">未配置目标语种</span>
                )}
              </div>

              <div className="border-t border-ink/15 pt-3 flex items-center justify-between text-xs">
                <span className="text-ink/60 font-mono">
                  上次出版 · {timeAgo(r.lastTranslatedAt)}
                </span>
                <span className="font-display text-vermilion">查 阅 →</span>
              </div>
            </Link>
          ))}
        </div>

        {uninstalled.length > 0 && (
          <div className="mt-12">
            <p className="label-kicker mb-3">尚未签约</p>
            <div className="border border-dashed border-ink/30 p-5 bg-paper-warm/40">
              {uninstalled.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="font-mono">{r.fullName}</span>
                  <span
                    title="GitHub App 尚未发布,发布后此处将跳转安装页"
                    className="font-display text-vermilion cursor-not-allowed opacity-70"
                  >
                    安 装 GitHub Global App
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <aside className="lg:col-span-3">
        <p className="label-kicker mb-3">Section B · Press Room</p>

        {activeRun && (
          <div className="border-2 border-vermilion p-4 bg-paper relative mb-6 animate-reveal">
            <div className="absolute -top-3 -right-3">
              <div className="w-3 h-3 bg-vermilion rounded-full animate-pulse-soft" />
            </div>
            <p className="label-kicker text-vermilion mb-2">译房进行中</p>
            <p className="font-mono text-xs mb-2 break-all">{activeRun.repoFullName}</p>
            <p className="font-display text-lg">
              {activeRun.filesDone} / {activeRun.filesTotal}
            </p>
            <div className="mt-3 h-1 bg-ink/10 relative">
              <div
                className="absolute top-0 left-0 h-full bg-vermilion transition-all"
                style={{ width: `${(activeRun.filesDone / activeRun.filesTotal) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="border border-ink/20 p-5 bg-paper">
          <div className="flex justify-center mb-3">
            <Seal size="sm">章</Seal>
          </div>
          <p className="font-display font-bold text-base mb-2 text-center">
            出版凭证 · Glossary
          </p>
          <p className="text-xs text-ink/70 leading-relaxed text-center">
            约定术语表 (.github-global/glossary.yml) 可让译稿口径一致。每仓库各自维护。
          </p>
        </div>

        <div className="mt-6 font-mono text-[11px] space-y-1 text-ink/60 border-t border-ink/20 pt-4">
          <p>—— 当期统计 ——</p>
          <p>签约仓库 ........ {installed.length}</p>
          <p>本月已译 ........ {mockRuns.filter(r => r.status === 'succeeded').length} 次</p>
          <p>失败 ........... {mockRuns.filter(r => r.status === 'failed').length} 次</p>
          <p>进行中 .......... {mockRuns.filter(r => r.status === 'running').length} 次</p>
        </div>
      </aside>
    </div>
  );
}
