import { cookies } from 'next/headers';

const SESSION_COOKIE = 'gg_session';

/**
 * Mock session — in real life this would be an encrypted JWT containing the
 * GitHub user id and our internal user id. Here we just store a flag.
 */
export async function getSession(): Promise<{ userId: number } | null> {
  const store = await cookies();
  const v = store.get(SESSION_COOKIE)?.value;
  if (!v) return null;
  try {
    return JSON.parse(v) as { userId: number };
  } catch {
    return null;
  }
}

export async function setSession(userId: number): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify({ userId }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
