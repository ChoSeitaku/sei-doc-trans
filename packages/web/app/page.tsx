import Link from 'next/link';
import { Masthead } from '@/components/masthead';
import { Footer } from '@/components/footer';
import { Seal } from '@/components/seal';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Masthead />

      <section className="flex-1 max-w-7xl w-full mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left rail: editorial metadata */}
        <aside className="lg:col-span-3 lg:border-r lg:border-ink/20 lg:pr-8 flex flex-col gap-8 animate-reveal">
          <div>
            <p className="label-kicker mb-3">本期主笔 · Editor</p>
            <p className="font-display text-lg">Anthropic × ChoSeitaku</p>
            <p className="text-sm text-ink/60 mt-1 font-latin italic">
              for the Chinese open-source diaspora
            </p>
          </div>
          <div>
            <p className="label-kicker mb-3">本期议题 · Topic</p>
            <ul className="text-sm space-y-1.5 list-none">
              <li>· 语言不应是边界</li>
              <li>· 源代码已经全球化</li>
              <li>· 而文档,尚未</li>
            </ul>
          </div>
          <div>
            <p className="label-kicker mb-3">译本 · Editions</p>
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {['EN', 'JA', 'KO', 'ES', 'FR'].map((l, i) => (
                <span
                  key={l}
                  className="inline-block px-2 py-1 border border-ink/30 animate-reveal"
                  style={{ animationDelay: `${0.1 + i * 0.06}s` }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: headline + lead */}
        <div className="lg:col-span-6 relative">
          <div className="absolute -top-6 -left-2 lg:-left-12">
            <Seal size="lg">译事</Seal>
          </div>

          <p className="label-kicker mb-5 animate-reveal">A Translator&apos;s Manifesto · 2026年第一期</p>

          <h2 className="font-display font-black text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-tight text-balance animate-reveal" style={{ animationDelay: '0.1s' }}>
            语言<br/>
            <span className="text-vermilion">不应</span><br/>
            是边界。
          </h2>

          <div className="mt-10 max-w-2xl animate-reveal" style={{ animationDelay: '0.25s' }}>
            <p className="font-body text-lg leading-relaxed text-ink/85 drop-cap">
              GitHub Global 是为中文开源项目而设的译本工坊。你的 README、文档、教程,在每一次推送后自动获得英、日、韩、西、法五种译本,并以 Pull Request 的形式回到你的仓库——像旧时报馆,稿件从前堂送进,凌晨于不同语种印房同时排版,翌日齐刷刷发往全球。
            </p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6 animate-reveal" style={{ animationDelay: '0.4s' }}>
            <Link href="/api/auth/login" className="btn-press btn-press--seal" prefetch={false}>
              以 GitHub 身份 登 入
              <span className="font-mono text-xs opacity-70">→</span>
            </Link>
            <Link href="#how" className="font-display text-sm underline-grow tracking-wider2">
              先 看 看 它 如 何 工 作
            </Link>
          </div>

          <div id="how" className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: 'I', t: '安 装', d: '将 GitHub Global App 安装到你的仓库,授予 docs 与 PR 权限。' },
              { n: 'II', t: '推 送', d: '当 main 分支的 .md/.mdx 文档变动,我们自动开始翻译。' },
              { n: 'III', t: '审 阅', d: '译稿以 PR 形式回到仓库,你审核、合并、发布。' },
            ].map((s, i) => (
              <article
                key={s.n}
                className="clipping animate-reveal"
                style={{ animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <p className="font-latin italic text-vermilion text-3xl mb-2">{s.n}.</p>
                <h3 className="font-display font-bold text-xl mb-2">{s.t}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{s.d}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Right rail: classified-ad style block */}
        <aside className="lg:col-span-3 lg:border-l lg:border-ink/20 lg:pl-8 flex flex-col gap-6 animate-reveal" style={{ animationDelay: '0.6s' }}>
          <div className="border border-ink/40 p-5 bg-paper-warm relative">
            <p className="label-kicker mb-3 text-vermilion">告 · ANNOUNCEMENT</p>
            <p className="font-display text-lg leading-snug mb-2">本期免费阅览</p>
            <p className="text-xs text-ink/70 leading-relaxed">
              测试期内,所有公共仓库免费享有翻译服务。注册时仅向 GitHub 索取最小必要权限。
            </p>
          </div>

          <div className="font-mono text-[11px] leading-5 text-ink/60 space-y-1">
            <p>—— SPECIMEN ——</p>
            <p>baseline ........ zh</p>
            <p>targets ......... 5 langs</p>
            <p>provider ........ deepseek</p>
            <p>chunker ......... AST-aware</p>
            <p>cache ........... content-hash</p>
            <p>delivery ........ Pull Request</p>
          </div>

          <blockquote className="border-l-2 border-vermilion pl-4 italic text-sm text-ink/75 font-latin">
            &ldquo;Code crossed the seas long ago.<br/>Now it is documentation&apos;s turn.&rdquo;
          </blockquote>
        </aside>
      </section>

      <Footer />
    </main>
  );
}
