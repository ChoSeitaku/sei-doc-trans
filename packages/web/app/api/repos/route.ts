import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { mockRepos } from '@/lib/mock-data';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  return NextResponse.json({ repos: mockRepos });
}
