import type {
  Repo,
  RepoDetail,
  TranslationRun,
  TriggerTranslationResponse,
  User,
} from './api-types';

export const mockUser: User = {
  id: 80211,
  login: 'choseitaku',
  name: '长星拓',
  avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
  email: 'shen@example.com',
};

export const mockRepos: Repo[] = [
  {
    id: 1,
    fullName: 'choseitaku/qingci-ui',
    owner: 'choseitaku',
    name: 'qingci-ui',
    description: '一套侘寂美学的 React 组件库,面向中文设计语境。',
    private: false,
    defaultBranch: 'main',
    installed: true,
    baselineLang: 'zh',
    targetLangs: ['en', 'ja'],
    lastTranslatedAt: '2026-05-26T14:22:00Z',
  },
  {
    id: 2,
    fullName: 'choseitaku/zhuque-cli',
    owner: 'choseitaku',
    name: 'zhuque-cli',
    description: '终端里的轻量任务编排器,使用 Go 编写,YAML 描述工作流。',
    private: false,
    defaultBranch: 'main',
    installed: true,
    baselineLang: 'zh',
    targetLangs: ['en', 'ja', 'ko', 'es', 'fr'],
    lastTranslatedAt: '2026-05-27T09:11:00Z',
  },
  {
    id: 3,
    fullName: 'choseitaku/mibei-notes',
    owner: 'choseitaku',
    name: 'mibei-notes',
    description: '本地优先的笔记应用,加密同步、Markdown 编辑、双向链接。',
    private: true,
    defaultBranch: 'develop',
    installed: true,
    baselineLang: 'zh',
    targetLangs: ['en'],
    lastTranslatedAt: null,
  },
  {
    id: 4,
    fullName: 'choseitaku/anhua-protocol',
    owner: 'choseitaku',
    name: 'anhua-protocol',
    description: '端到端加密的群组通讯协议规范文档。',
    private: false,
    defaultBranch: 'main',
    installed: false,
    baselineLang: 'zh',
    targetLangs: [],
    lastTranslatedAt: null,
  },
];

export const mockRuns: TranslationRun[] = [
  {
    id: 'run_a3f9',
    repoFullName: 'choseitaku/zhuque-cli',
    targets: ['en', 'ja', 'ko', 'es', 'fr'],
    status: 'succeeded',
    startedAt: '2026-05-27T09:05:14Z',
    finishedAt: '2026-05-27T09:11:48Z',
    filesTotal: 24,
    filesDone: 24,
    prUrl: 'https://github.com/choseitaku/zhuque-cli/pull/142',
    error: null,
  },
  {
    id: 'run_b412',
    repoFullName: 'choseitaku/qingci-ui',
    targets: ['en', 'ja'],
    status: 'succeeded',
    startedAt: '2026-05-26T14:17:02Z',
    finishedAt: '2026-05-26T14:22:38Z',
    filesTotal: 11,
    filesDone: 11,
    prUrl: 'https://github.com/choseitaku/qingci-ui/pull/57',
    error: null,
  },
  {
    id: 'run_c901',
    repoFullName: 'choseitaku/zhuque-cli',
    targets: ['en'],
    status: 'running',
    startedAt: '2026-05-28T08:48:11Z',
    finishedAt: null,
    filesTotal: 8,
    filesDone: 3,
    prUrl: null,
    error: null,
  },
  {
    id: 'run_d244',
    repoFullName: 'choseitaku/mibei-notes',
    targets: ['en'],
    status: 'failed',
    startedAt: '2026-05-25T22:01:09Z',
    finishedAt: '2026-05-25T22:01:47Z',
    filesTotal: 6,
    filesDone: 0,
    prUrl: null,
    error: 'DEEPSEEK_API_KEY 未配置,翻译请求被拒绝。',
  },
];

export function mockRepoDetail(fullName: string): RepoDetail | null {
  const base = mockRepos.find((r) => r.fullName === fullName);
  if (!base) return null;
  return {
    ...base,
    candidateFiles: [
      { path: 'README.md', size: 8421, lastModified: '2026-05-22T03:11:00Z' },
      { path: 'docs/getting-started.md', size: 4290, lastModified: '2026-05-20T18:42:00Z' },
      { path: 'docs/concepts/workflow.md', size: 6188, lastModified: '2026-05-18T11:09:00Z' },
      { path: 'docs/concepts/config.md', size: 3402, lastModified: '2026-05-15T09:55:00Z' },
      { path: 'docs/recipes/ci-cd.md', size: 5710, lastModified: '2026-05-12T07:33:00Z' },
    ],
    glossaryCount: 18,
    cacheHits: 142,
    recentRuns: mockRuns.filter((r) => r.repoFullName === fullName).slice(0, 3),
  };
}

export function makeTriggerResponse(
  repoFullName: string,
  targets: string[]
): TriggerTranslationResponse & { run: TranslationRun } {
  const id = `run_${Math.random().toString(36).slice(2, 6)}`;
  const run: TranslationRun = {
    id,
    repoFullName,
    targets,
    status: 'queued',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    filesTotal: 5,
    filesDone: 0,
    prUrl: null,
    error: null,
  };
  mockRuns.unshift(run);
  return { runId: id, run };
}
