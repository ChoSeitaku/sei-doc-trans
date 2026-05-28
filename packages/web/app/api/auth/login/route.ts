import { NextResponse } from 'next/server';

/**
 * In mock mode, "GitHub OAuth" is a no-op: we immediately bounce back to our
 * own /auth/callback with a synthetic code. In real mode this would redirect
 * to GitHub's authorize URL with the GitHub App's client_id.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = crypto.randomUUID();
  const cb = new URL('/auth/callback', url.origin);
  cb.searchParams.set('code', `mock_${state.slice(0, 8)}`);
  cb.searchParams.set('state', state);
  return NextResponse.redirect(cb);
}
