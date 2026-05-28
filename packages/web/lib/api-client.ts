/**
 * Client-side fetch helpers. In mock mode these all hit our local Route Handlers
 * under /app/api/*. The functions are isomorphic — they also work from Server
 * Components because they always use absolute URLs derived from headers().
 */

import type {
  Repo,
  RepoDetail,
  TranslationRun,
  TriggerTranslationRequest,
  TriggerTranslationResponse,
  User,
} from './api-types';

function base(): string {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Request to ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => jsonFetch<User>('/api/auth/me'),
  logout: () => jsonFetch<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
  repos: () => jsonFetch<{ repos: Repo[] }>('/api/repos'),
  repo: (owner: string, repo: string) =>
    jsonFetch<RepoDetail>(`/api/repos/${owner}/${repo}`),
  triggerTranslation: (
    owner: string,
    repo: string,
    body: TriggerTranslationRequest
  ) =>
    jsonFetch<TriggerTranslationResponse>(`/api/repos/${owner}/${repo}/translate`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  runs: () => jsonFetch<{ runs: TranslationRun[] }>('/api/translations'),
};
