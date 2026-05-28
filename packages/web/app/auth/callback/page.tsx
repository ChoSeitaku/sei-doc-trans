'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Seal } from '@/components/seal';

export default function CallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [message, setMessage] = useState('正在与 GitHub 印房交换凭证');

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      setPhase('error');
      setMessage('缺少授权码,无法继续。');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!res.ok) throw new Error(await res.text());
        if (cancelled) return;
        setPhase('success');
        setMessage('登入成功,正在前往个人译房');
        setTimeout(() => router.replace('/dashboard'), 900);
      } catch (e) {
        if (cancelled) return;
        setPhase('error');
        setMessage(e instanceof Error ? e.message : '未知错误');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-paper px-8 relative">
      {/* Newspaper rules */}
      <div className="absolute top-0 left-0 right-0 border-t-2 border-ink" />
      <div className="absolute top-2 left-0 right-0 border-t border-ink/30" />
      <div className="absolute bottom-0 left-0 right-0 border-b-2 border-ink" />
      <div className="absolute bottom-2 left-0 right-0 border-b border-ink/30" />

      <div className="max-w-md w-full text-center">
        <p className="label-kicker mb-6">OAuth · Handshake in progress</p>

        <div className="flex justify-center mb-8">
          {phase === 'success' ? (
            <Seal size="lg">已译</Seal>
          ) : phase === 'error' ? (
            <div className="w-24 h-24 border-2 border-vermilion flex items-center justify-center font-display text-vermilion text-3xl">
              ✕
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-ink/40 flex items-center justify-center">
              <div className="w-3 h-3 bg-vermilion rounded-full animate-pulse-soft" />
            </div>
          )}
        </div>

        <h1 className="font-display font-bold text-3xl mb-3 text-balance">
          {phase === 'success' ? '凭证已盖印' : phase === 'error' ? '交接失败' : '请稍候'}
        </h1>

        <p className="text-ink/70 leading-relaxed font-body">{message}</p>

        {phase === 'error' && (
          <a
            href="/"
            className="btn-press mt-8 inline-flex"
          >
            返 回 首 页
          </a>
        )}
      </div>
    </main>
  );
}
