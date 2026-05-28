import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { Masthead } from '@/components/masthead';
import { Footer } from '@/components/footer';
import { mockUser } from '@/lib/mock-data';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');

  // In real mode we'd fetch the user; mock just returns the fixture.
  const user = mockUser;

  return (
    <div className="min-h-screen flex flex-col">
      <Masthead />

      <div className="max-w-7xl w-full mx-auto px-8 mt-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink/20">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.login}
            className="w-12 h-12 rounded-none border-2 border-ink grayscale"
          />
          <div className="leading-tight">
            <p className="label-kicker">Subscriber · 订阅人</p>
            <p className="font-display text-xl font-medium">{user.name}</p>
            <p className="text-xs text-ink/60 font-mono">@{user.login}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 text-sm font-display">
          <Link href="/dashboard" className="px-4 py-2 hover:bg-paper-warm border border-transparent hover:border-ink/20">
            仓 库 列 表
          </Link>
          <Link href="/dashboard/translations" className="px-4 py-2 hover:bg-paper-warm border border-transparent hover:border-ink/20">
            译 事 录
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="px-4 py-2 text-vermilion hover:bg-vermilion hover:text-paper border border-transparent hover:border-vermilion transition-colors"
            >
              登 出
            </button>
          </form>
        </nav>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-10">{children}</main>

      <Footer />
    </div>
  );
}
