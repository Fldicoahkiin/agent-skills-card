<div align="center">

<img src="public/favicon.svg" width="72" alt="Agent Skills Card" />

# Agent Skills Card

**Put your Agent Skills on your GitHub profile, install commands included**

**English** · [中文](README.md)

[Try it](https://agent-skills-card.flacier.com) · [Vercel mirror](https://agent-skills-card.vercel.app) · [API](#api)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Fldicoahkiin/agent-skills-card)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fldicoahkiin/agent-skills-card&env=GITHUB_TOKEN&envDescription=Read-only%20GitHub%20PAT%20(optional))

<br />

[![My Agent Skills](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=candy&title=Agent%20Skills)](https://agent-skills-card.flacier.com/?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=candy&title=Agent%20Skills)

<sub>↑ Rendered live by this very product. Click it to open the configurator and copy each install command.</sub>

</div>

## Why

Agent Skills are becoming a de-facto standard: one repo is one skill, and `npx skills add owner/repo` installs it into Claude Code / Codex / Cursor. But GitHub's repo cards don't carry that command — nothing marks a repo as a skill, or shows how to install it.

Agent Skills Card turns them into a card: pick repos → pick a style and layout → paste one line of Markdown into your README. The image is rendered live by `/api/svg` with descriptions synced from GitHub; visitors click the card back to the configurator, where every `npx` command is one click to copy.

## 15 styles × 4 layouts × light/dark

Styles: **Candy** (the site's own look — the hero card above) / **Claude** / **GitHub** / **Terminal** / **Brutalist** / **Blueprint** / **Neon** / **Editorial** / **Minimal** / **Gruvbox** / **Nord** / **Dracula** / **Catppuccin** / **Vercel** / **Codex**, each in light and dark. Layouts: `full` (830, full detail) / `list` (495, half width) / `grid` (640, two-column tiles) / `banner` (830, slim strip).

With the Terminal style, the card renders as an actual terminal window:

[![terminal style](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=terminal&theme=dark)](https://agent-skills-card.flacier.com/?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&style=terminal&theme=dark)

| `grid` × Blueprint | `list` × Brutalist |
| :---: | :---: |
| [![blueprint grid](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent,anthropics/knowledge-work-plugins&variant=grid&style=blueprint&theme=dark)](https://agent-skills-card.flacier.com/?variant=grid&style=blueprint&theme=dark&skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent,anthropics/knowledge-work-plugins) | [![brutalist list](https://agent-skills-card.flacier.com/api/svg?skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent&variant=list&style=brutalist)](https://agent-skills-card.flacier.com/?variant=list&style=brutalist&skills=anthropics/skills,anthropics/claude-plugins-official,anthropics/launch-your-agent) |

## Quick start

1. Open [agent-skills-card.flacier.com](https://agent-skills-card.flacier.com);
2. Add repos one by one as `owner/repo`, or type a **GitHub username** — it lists all public repos and flags which ones are skills;
3. Pick style, layout, light/dark; toggle description and command;
4. Copy the Markdown into your README. Done:

```markdown
[![My Agent Skills](https://agent-skills-card.flacier.com/api/svg?skills=you/your-skill)](https://agent-skills-card.flacier.com/?skills=you/your-skill)
```

## How skill repos are detected

When you type a username, `/api/discover` flags a repo as a skill if **any** of these hit, strongest first:

1. **The repo contains a `SKILL.md`** — the de-facto standard marker, found by one code-search call (`filename:SKILL.md user:X`). Requires the server's `GITHUB_TOKEN`; tokenless self-hosts skip this layer.
2. **The repo root has a `SKILL.md` or a `skills-lock.json`** (the skills CLI lockfile) — probed directly on the raw CDN, works without any token; only repos the other signals missed get probed, budget-capped.
3. **A topic contains the word segment `skill(s)`** — e.g. `claude-skills`, `agent-skill`, `skill-library` — or a fused alias like `openskills`.
4. **The repo name contains the segment `skill(s)`** in any position — `skill-example`, `my-skill-pack`, `agent-skills`.
5. **The description mentions skill(s) together with a domain word** — claude / agent / anthropic / ai / llm / SKILL.md.

**Skill author and not detected?** Add a `SKILL.md` at the repo root (it's the standard anyway), or add a `claude-skills` topic — either makes your repo light up. Collection repos with only nested `skills/*/SKILL.md` need the server token's code search — a root marker file is the portable fix for every user of this tool. Detection is deliberately recall-first: false positives are cheap because nothing is auto-added — users tick what goes on the card.

## How it works

- **One isomorphic render core** (`src/render/`): a pure function `renderSvg(config) → SVG`. The config site previews it in the browser; `/api/svg` renders the same code server-side.
- **The URL is the state**: repos, style, and layout all live in the query string; the server fetches descriptions from the GitHub API at render time.
- **Hand-built structured SVG** (no satori): CJK-aware text measurement, commands shrink-to-fit before truncating, zero font payload on the edge worker.
- **Hono on Workers**: `run_worker_first` routes `/api/*` to the Worker; everything else falls back to the SPA.

### Why can't I click a single skill on the card in a README?

GitHub proxies every README image through its own CDN (camo) and renders it as an `<img>` — Markdown and HTML embeds go through the same pipeline. An SVG inside `<img>` is an isolated document: its inner `<a>` links receive no clicks, scripts never run, external requests are blocked. So:

- **Per-skill links and copy buttons**: impossible inside a README, and switching to HTML changes nothing — GitHub's HTML sanitizer keeps only `<img>` (`<object>` / `<iframe>` / inline `<svg>` are stripped), and copying would need JS, which a README never runs.
- **One link for the whole card**: works. That's why the export snippets link the card back to the configurator — visitors click through, then copy each command or open each repo in one click.
- **Opening the SVG directly** (hitting `/api/svg?...` in the browser): every skill's `<a>` on the card is clickable — the capability is in the image; a README `<img>` just can't use it.

## Local development

```bash
bun install
cp .dev.vars.example .dev.vars   # optional: a read-only PAT raises local rate limits
bun run dev                      # http://localhost:5173, runs the real workerd runtime
```

Also: `bun run build`, `bun run typecheck`, `bun run test`, `bun run lint`.

## Deploy (Cloudflare Workers or Vercel)

One codebase, either platform. `vite.config.ts` loads `@cloudflare/vite-plugin` conditionally on the `VERCEL` env var: Cloudflare gets a Worker + Static Assets, Vercel gets a plain SPA + an `api/` Edge Function.

### Cloudflare Workers

```bash
bunx wrangler login
bun run deploy                          # = build (with typecheck) + wrangler deploy
bunx wrangler secret put GITHUB_TOKEN    # optional, see below
```

Or connect the repo via the Cloudflare dashboard ("Connect Git") for deploy-on-push. `/api/*` hits the Worker (`run_worker_first`); static assets go through Workers Static Assets. See [`wrangler.jsonc`](wrangler.jsonc).

### Vercel

```bash
bunx vercel         # first run: log in + link the project (auto-detected as Vite)
bunx vercel --prod  # deploy to production
```

Or import the repo in the Vercel dashboard for deploy-on-push. `/api/*` is served by [`api/index.ts`](api/index.ts) as an Edge Function (`vercel.json` rewrites `/api/*` to it); set `GITHUB_TOKEN` under Settings → Environment Variables (optional). See [`vercel.json`](vercel.json).

> The config site uses the browser origin when generating README snippets. After deploying, set `VITE_PUBLIC_ORIGIN=https://your-domain` (Cloudflare: dashboard or wrangler `vars`; Vercel: project env) so copied links point at production instead of localhost.

### GITHUB_TOKEN (optional but recommended)

Without a token, unauthenticated GitHub API calls are limited to **60/hour per IP**. A read-only Personal Access Token (no scopes needed, public repos only) raises that to **5,000/hour** and unlocks the SKILL.md code search — the strongest detection signal. Combined with `/api/svg`'s long cache, that's plenty for personal use.

## API

`GET /api/svg` — returns `image/svg+xml`. All parameters optional.

| Param     | Meaning                          | Values                                                       | Default  |
| --------- | -------------------------------- | ------------------------------------------------------------ | -------- |
| `skills`  | Repos, comma-separated `owner/repo` | up to 24                                                   | —        |
| `title`   | Card title                       | text (≤80)                                                    | My Agent Skills |
| `style`   | Style                            | `claude` `github` `terminal` `brutalist` `blueprint` `neon` `editorial` `minimal` `gruvbox` `nord` `dracula` `catppuccin` | `claude` |
| `theme`   | Card theme                       | `light` `dark`                                                | `light`  |
| `variant` | Layout                           | `full` `list` `grid` `banner`                                 | `full`   |
| `desc`    | Show repo descriptions           | `1` / `0`                                                     | `1`      |
| `install` | Show install commands            | `1` / `0`                                                     | `1`      |
| `cmd`     | Install command template         | text with `{repo}` placeholder, e.g. `curl …/{repo}/HEAD/install.sh \| sh` | `npx skills add {repo}` |
| `d0`…`d23`| Per-repo description override    | text (≤140), index matches `skills` order                     | —        |

Helper endpoints (used by the config site): `GET /api/repo?repo=owner/repo` (single repo metadata), `GET /api/discover?user=name` (list a user's public repos, skills flagged and sorted first).

## Extend

- **Add a style**: append a light+dark token pair to `STYLES` in `src/render/styles.ts` and register it in `STYLE_META`.
- **Add a layout**: write a `Template` in `src/render/templates/`, add it to the array in `templates/index.ts` (plus `VARIANT_WIDTH`) — the site and the API pick it up automatically.

## Stack

Vite + React + Tailwind v4 (config site, warm-paper dual theme) · hand-built structured SVG (isomorphic render) · Hono on Cloudflare Workers / Vercel Edge · TypeScript
