import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { mockRepoDetail } from '@/lib/mock-data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  const { owner, repo } = await params;
  const detail = mockRepoDetail(`${owner}/${repo}`);
  if (!detail) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(detail);
}
