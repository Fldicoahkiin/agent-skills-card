<div align="center">

<img src="public/favicon.svg" width="72" alt="Agent Skills Card" />

# Agent Skills Card

**把 Agent Skills 连同安装命令一起摆上 GitHub 主页**

[English](README.en.md) · **中文**

[在线使用](https://agent-skills-card.flacier.com) · [Vercel 镜像](https://agent-skills-card.vercel.app) · [API](#api)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Fldicoahkiin/agent-skills-card)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fldicoahkiin/agent-skills-card&env=GITHUB_TOKEN&envDescription=%E5%8F%AA%E8%AF%BB%20GitHub%20PAT%EF%BC%88%E5%8F%AF%E9%80%89%EF%BC%89)

<br />

[![My Agent Skills](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=candy&title=Agent%20Skills)](https://agent-skills-card.flacier.com/?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=candy&title=Agent%20Skills)

<sub>↑ 这张卡就是它自己渲染的。点开,在配置站一键复制每条安装命令。</sub>

</div>

## 为什么

Agent Skills 正在变成事实标准:一个仓库就是一个 skill,`npx skills add owner/repo` 一条命令装进 Claude Code / Codex / Cursor。但 GitHub 的仓库卡片上没有这条命令——看不出一个仓库是 skill,更看不出怎么装。

Agent Skills Card 把它们变成一张卡:挑仓库 → 选风格与形态 → 复制一段 Markdown 贴进 README。图片由 `/api/svg` 实时渲染,描述取自 GitHub;访客点卡片回到配置站,一键复制每条 `npx` 命令。

## 十五套风格 × 四种形态 × 明暗

风格:**Candy**(站点同款,上面这张就是)/ **Claude** / **GitHub** / **Terminal** / **Brutalist** / **Blueprint** / **Neon** / **Editorial** / **Minimal** / **Gruvbox** / **Nord** / **Dracula** / **Catppuccin** / **Vercel** / **Codex**,每套亮暗两版。形态:`full`(830 全宽详情)/ `list`(495 半宽速览)/ `grid`(640 双列磁贴)/ `banner`(830 矮条标签)。

Terminal 风格下,卡片直接渲染成一扇终端窗口:

[![terminal style](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=terminal&theme=dark)](https://agent-skills-card.flacier.com/?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=terminal&theme=dark)

| `grid` × Blueprint | `list` × Brutalist |
| :---: | :---: |
| [![blueprint grid](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent,anthropics/knowledge-work-plugins&variant=grid&style=blueprint&theme=dark)](https://agent-skills-card.flacier.com/?variant=grid&style=blueprint&theme=dark&skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent,anthropics/knowledge-work-plugins) | [![brutalist list](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&variant=list&style=brutalist)](https://agent-skills-card.flacier.com/?variant=list&style=brutalist&skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent) |

## 快速开始

1. 打开 [agent-skills-card.flacier.com](https://agent-skills-card.flacier.com);
2. 输入 `owner/repo` 逐个添加,或直接输入 **GitHub 用户名**——自动列出全部公开仓库并标出哪些是 skill;
3. 选风格、形态、明暗,开关描述与命令;
4. 复制 Markdown 贴进 README。完事:

```markdown
[![My Agent Skills](https://agent-skills-card.flacier.com/api/svg?skills=you/your-skill)](https://agent-skills-card.flacier.com/?skills=you/your-skill)
```

## skill 仓库是怎么被识别的

输入用户名后,`/api/discover` 按下面几路信号标记 skill 仓库,**任一命中即标**,从强到弱:

1. **仓库内含 `SKILL.md`**——事实标准标记,一次 code search(`filename:SKILL.md user:X`)查出。需要服务端配 `GITHUB_TOKEN`;无 token 的自部署会跳过这层。
2. **仓库根目录有 `SKILL.md` 或 `skills-lock.json`**(skills CLI 锁文件)——直接探 raw CDN,不需要任何 token;只探其他信号没标中的仓库,带预算上限。
3. **topic 含 `skill(s)` 词段**——如 `claude-skills`、`agent-skill`、`skill-library`,以及 `openskills` 这类拼连别名。
4. **仓库名含 `skill(s)` 词段**,前/中/后缀都算——`skill-example`、`my-skill-pack`、`agent-skills`。
5. **描述同时提到 skill(s) 和领域词**——claude / agent / anthropic / ai / llm / SKILL.md。

**你是 skill 作者但没被识别?** 在仓库根加一个 `SKILL.md`(本来就是标准),或加一个 `claude-skills` topic——任意一个都能让你的仓库在所有用这个工具的人面前亮起来。只有嵌套 `skills/*/SKILL.md` 的集合仓库要靠服务端 token 的 code search,加个根标记文件是最通用的适配。识别刻意宁多勿漏:误标很便宜,因为不会自动添加任何仓库——上不上卡由用户勾选。

## 工作原理

- **一份同构渲染核心**(`src/render/`):纯函数 `renderSvg(config) → SVG`。配置站做浏览器内实时预览,服务端 `/api/svg` 出图,二者一致。
- **配置编码进 URL**:展示哪些 repo + 风格/形态全在 query 里;服务端渲染时实时调 GitHub API 取描述。
- **手拼结构化 SVG**(非 satori):CJK 感知的文本度量、命令先缩字号后截断、零字体负担跑在边缘 Worker 上。
- **Hono on Workers**:`run_worker_first` 让 `/api/*` 命中 Worker,其余走 SPA 静态资源。

### 为什么 README 里的卡片点不了单个 skill?

GitHub 会把 README 里的所有图片代理到自家 CDN(camo),以 `<img>` 呈现——Markdown 和 HTML 写法走的是同一条管线。`<img>` 里的 SVG 是一份隔离文档:内部 `<a>` 收不到点击,脚本不执行,外部请求被拦截。所以:

- **单个 skill 跳转、复制按钮**:README 里做不到,换 HTML 写法也一样——GitHub 的 HTML 白名单只留 `<img>`,`<object>` / `<iframe>` / 内联 `<svg>` 全部被剥掉;复制还需要 JS,而 README 里永远没有 JS。
- **整张卡一个链接**:可以。所以导出片段把卡片链回配置站,访客点卡进站,每条命令一键复制、每个仓库一键直达。
- **直接打开 SVG**(浏览器访问 `/api/svg?...`):卡上每个 skill 的 `<a>` 都可点——能力写在图里,只是 README 的 `<img>` 用不上它。

## 本地开发

```bash
bun install
cp .dev.vars.example .dev.vars   # 可选:填只读 PAT 提升本地取数限额
bun run dev                      # http://localhost:5173 ,跑真实 workerd 运行时
```

其它:`bun run build`、`bun run typecheck`、`bun run test`、`bun run lint`。

## 部署(Cloudflare Workers 或 Vercel)

同一份代码两端皆可。`vite.config.ts` 按 `VERCEL` 环境变量条件加载 `@cloudflare/vite-plugin`:CF 出 Worker + Static Assets,Vercel 退回标准 SPA + `api/` Edge Function。

### Cloudflare Workers

```bash
bunx wrangler login
bun run deploy                          # = build(含 typecheck) + wrangler deploy
bunx wrangler secret put GITHUB_TOKEN    # 可选,见下方
```

或在 Cloudflare 控制台「连接 Git」绑定本仓库,push 自动构建部署。`/api/*` 落到 Worker(`run_worker_first`),静态资源走 Workers Static Assets。配置见 [`wrangler.jsonc`](wrangler.jsonc)。

### Vercel

```bash
bunx vercel         # 首次:登录 + 关联项目(框架自动识别为 Vite)
bunx vercel --prod  # 部署到生产
```

或在 Vercel 控制台 import 本仓库,push 自动部署。`/api/*` 由 [`api/index.ts`](api/index.ts) 这个 Edge Function 处理(`vercel.json` 把 `/api/*` rewrite 到它);`GITHUB_TOKEN` 在项目 Settings → Environment Variables 里设(可选)。配置见 [`vercel.json`](vercel.json)。

> 生成 README 片段时,配置站默认用浏览器地址作 origin。部署后设环境变量 `VITE_PUBLIC_ORIGIN=https://你的域名`(CF 在 dashboard 或 wrangler `vars`、Vercel 在项目 env),复制出来的链接就指向线上而非 localhost。

### GITHUB_TOKEN(可选但推荐)

不配 token 时,GitHub API 未认证限流为 **60 次/小时**(按 IP)。配一个只读的 Personal Access Token(无需任何 scope,公开仓库即可)后提升到 **5000 次/小时**,同时解锁 SKILL.md code search——最强的识别信号。配合 `/api/svg` 的长缓存,个人使用通常够用。

## API

`GET /api/svg` — 返回 `image/svg+xml`。所有参数可选。

| 参数      | 含义                        | 取值                                                        | 默认     |
| --------- | --------------------------- | ----------------------------------------------------------- | -------- |
| `skills`  | 仓库,逗号分隔 `owner/repo` | 最多 24 个                                                   | —        |
| `title`   | 卡片标题                    | 文本(≤80)                                                  | My Agent Skills |
| `style`   | 风格                        | `claude` `github` `terminal` `brutalist` `blueprint` `neon` `editorial` `minimal` `gruvbox` `nord` `dracula` `catppuccin` | `claude` |
| `theme`   | 卡片明暗                    | `light` `dark`                                               | `light`  |
| `variant` | 形态                        | `full` `list` `grid` `banner`                                | `full`   |
| `desc`    | 显示仓库描述                | `1` / `0`                                                    | `1`      |
| `install` | 显示安装命令                | `1` / `0`                                                    | `1`      |
| `cmd`     | 安装命令模板                | 文本,`{repo}` 占位,如 `curl …/{repo}/HEAD/install.sh \| sh` | `npx skills add {repo}` |
| `d0`…`d23`| 每仓库自定义描述            | 文本(≤140),序号对应 `skills` 顺序                          | —        |

辅助端点(配置站用):`GET /api/repo?repo=owner/repo`(单仓库元数据)、`GET /api/discover?user=用户名`(列出某用户公开仓库,skill 仓库标记并优先)。

## 扩展

- **加风格**:往 `src/render/styles.ts` 的 `STYLES` 加 light+dark 两套 token,并在 `STYLE_META` 登记名字与色板。
- **加形态**:在 `src/render/templates/` 写一个 `Template`,塞进 `templates/index.ts` 的数组(附 `VARIANT_WIDTH`),配置站和 API 自动支持。

## 技术栈

Vite + React + Tailwind v4(配置站,暖纸色双主题) · 手拼结构化 SVG(同构渲染) · Hono on Cloudflare Workers / Vercel Edge · TypeScript
