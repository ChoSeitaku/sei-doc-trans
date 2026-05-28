/**
 * Frontend ↔ backend API contract.
 *
 * Mock mode (NEXT_PUBLIC_USE_MOCK=1) routes these through the Route Handlers
 * under /app/api/*. Real mode hits NEXT_PUBLIC_API_BASE_URL.
 */

export interface User {
  id: number;
  login: string;
  name: string;
  avatarUrl: string;
  email: string | null;
}

export interface Repo {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  installed: boolean;
  baselineLang: string;
  targetLangs: string[];
  lastTranslatedAt: string | null;
}

export interface RepoDetail extends Repo {
  candidateFiles: { path: string; size: number; lastModified: string }[];
  glossaryCount: number;
  cacheHits: number;
  recentRuns: TranslationRun[];
}

export interface TranslationRun {
  id: string;
  repoFullName: string;
  targets: string[];
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  startedAt: string;
  finishedAt: string | null;
  filesTotal: number;
  filesDone: number;
  prUrl: string | null;
  error: string | null;
}

export interface TriggerTranslationRequest {
  targets: string[];
  force?: boolean;
}

export interface TriggerTranslationResponse {
  runId: string;
}
