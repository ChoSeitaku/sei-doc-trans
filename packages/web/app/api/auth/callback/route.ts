import { NextResponse } from 'next/server';
import { setSession } from '@/lib/session';
import { mockUser } from '@/lib/mock-data';

/**
 * Mock callback: pretends to exchange `code` for an access_token then sets the
 * session cookie. Real implementation would POST to GitHub's
 * /login/oauth/access_token endpoint with client_id + client_secret + code.
 */
export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 });
  await setSession(mockUser.id);
  return NextResponse.json({ user: mockUser });
}
