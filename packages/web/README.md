# GitHub Global · Web Dashboard

中文开源项目的多语言译本工坊 —— 前端界面(Next.js 15 + App Router + Tailwind v3.4)。

> 该包仅包含**前端**。所有 `/api/*` 端点目前由 Next.js Route Handlers 提供 Mock 数据,前端可零依赖地独立运行。后端接入只需把 `NEXT_PUBLIC_USE_MOCK` 关闭并填上 `NEXT_PUBLIC_API_BASE_URL`。

---

## 一、环境要求

| 依赖 | 版本 | 备注 |
|---|---|---|
| Node.js | ≥ 18.18 | 推荐 20.x |
| pnpm | ≥ 9 | monorepo 用 pnpm workspace |
| Git Bash | — | Windows 下必须使用 Git Bash 终端 |

---

## 二、快速启动(Windows · Git Bash)

> ⚠️ **必须使用 Git Bash**,不要用 PowerShell / CMD。本仓库的脚本约定 Unix 路径分隔符。

```bash
# 1. 在仓库根目录安装所有 workspace 依赖
cd /f/WORKFLOW/sei-doc-trans
pnpm install

# 2. 复制环境变量样板(默认就是 Mock 模式,不需改)
cp packages/web/.env.local.example packages/web/.env.local

# 3. 启动开发服务器
pnpm --filter @github-global/web dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可。

---

## 三、可访问页面

| 路径 | 说明 |
|---|---|
| `/` | 落地页 — 报刊出版社风格 + 中国红主题,点 "以 GitHub 身份登入" 触发模拟 OAuth |
| `/auth/callback` | OAuth 回调中转页(显示交换 token 进度) |
| `/dashboard` | 仪表盘 — 已签约仓库网格 + 当前译事进度 |
| `/dashboard/repos/{owner}/{repo}` | 仓库详情 — 勾选目标语种 → 开印 |
| `/dashboard/translations` | 译事录 — 历史任务列表 + PR 链接 |

可直接试用的仓库 fixture:
- `choseitaku/qingci-ui`
- `choseitaku/zhuque-cli`
- `choseitaku/mibei-notes`

---

## 四、Mock 模式与真实后端切换

### 当前(Mock 模式)

`packages/web/.env.local`:
```
NEXT_PUBLIC_USE_MOCK=1
```

所有 `/api/*` 请求都由 `app/api/**/route.ts` 处理,数据来源为 `lib/mock-data.ts`。session 用 httpOnly cookie 标记登录态。

### 接入真实后端

```
NEXT_PUBLIC_USE_MOCK=0
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

`lib/api-client.ts` 会自动指向远端 base URL。需要后端实现以下契约(已在 `lib/api-types.ts` 中以 TypeScript 类型定义):

```
GET  /api/auth/login          # 302 → GitHub authorize_url
POST /api/auth/callback       # body: { code } → { user: User }
GET  /api/auth/me             # → User
POST /api/auth/logout         # → { ok: true }
GET  /api/repos               # → { repos: Repo[] }
GET  /api/repos/:o/:r         # → RepoDetail
POST /api/repos/:o/:r/translate # body: { targets, force? } → { runId }
GET  /api/translations        # → { runs: TranslationRun[] }
```

---

## 五、目录结构

```
packages/web/
├── app/
│   ├── layout.tsx              # 根 layout(字体、全局样式注入)
│   ├── page.tsx                # 落地页(报刊编辑风 + 中国红)
│   ├── globals.css             # 设计令牌 + 自定义 components 层
│   ├── auth/callback/page.tsx  # OAuth code 交换中转
│   ├── dashboard/
│   │   ├── layout.tsx          # 守卫 + 用户卡片 + 导航
│   │   ├── page.tsx            # 仓库列表 + 当前译事
│   │   ├── repos/[owner]/[repo]/page.tsx
│   │   └── translations/page.tsx
│   └── api/                    # Mock Route Handlers(切换后端时可保留或删除)
├── components/
│   ├── masthead.tsx            # 报头
│   ├── footer.tsx
│   ├── seal.tsx                # 印章组件
│   └── repo-detail-view.tsx    # 仓库详情交互(client)
├── lib/
│   ├── api-types.ts            # 前后端共享类型
│   ├── api-client.ts           # fetch 封装
│   ├── mock-data.ts            # fixture
│   └── session.ts              # cookie 会话
├── tailwind.config.ts          # 设计令牌(中国红 vermilion / paper / ink / gold)
├── package.json
└── tsconfig.json
```

---

## 六、设计系统笔记

| Token | 值 | 用途 |
|---|---|---|
| `paper` | `#f4ece0` | 主底色(宣纸暖白) |
| `ink` | `#1a1410` | 主前景(墨黑) |
| `vermilion` | `#b91c1c` | 中国红主色(印章 · CTA · 强调) |
| `gold` | `#b8860b` | 辅助色(分隔/标记) |

字体:
- 显示体:Noto Serif SC(中文标题),Cormorant Garamond(拉丁文衬线)
- 正文:Noto Serif SC(细字号)
- 等宽:JetBrains Mono(代码 / 标签 / 编号)

不使用任何蓝紫渐变 · 不使用 Inter/Roboto/Arial。

---

## 七、常见问题

**Q: 启动时报 `Cannot find module 'tailwindcss'`?**
A: 在仓库根目录跑 `pnpm install`(不是在 `packages/web/` 里跑)。

**Q: 浏览器拿不到字体?**
A: `globals.css` 从 Google Fonts 加载;如所在网络不通,把 `@import url(...)` 那一行换成本地字体文件即可,不影响功能。

**Q: 点击登入后回到 `/auth/callback` 卡在 "正在交换凭证"?**
A: 打开浏览器 DevTools → Network,检查 `/api/auth/callback` 是否返回 200。开发模式下若刚改过 `app/api/*` 路由,Next.js 偶尔需要重启 dev server。

**Q: 怎么登出?**
A: 仪表盘右上角 "登 出" 按钮,或访问 `/api/auth/logout`(POST)。

---

## 八、构建发布

```bash
pnpm --filter @github-global/web build
pnpm --filter @github-global/web start
```

默认 3000 端口。生产环境前请把 Mock 路由删除或在 `next.config.mjs` 中重写到真实 API。
