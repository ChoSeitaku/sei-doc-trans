import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { makeTriggerResponse } from '@/lib/mock-data';
import type { TriggerTranslationRequest } from '@/lib/api-types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { owner, repo } = await params;
  const body = (await req.json().catch(() => ({}))) as Partial<TriggerTranslationRequest>;
  if (!body.targets?.length) {
    return NextResponse.json({ error: '至少选择一种目标语言' }, { status: 400 });
  }
  const { runId } = makeTriggerResponse(`${owner}/${repo}`, body.targets);
  return NextResponse.json({ runId });
}
