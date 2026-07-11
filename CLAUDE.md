# agent-skills-card

Generate a dynamic SVG card for a GitHub profile README that showcases a set of agent skills
repos, each with a one-click `npx skills add` command — a replacement for pinned repos. A static
config site produces a Markdown snippet; the image is rendered live by `/api/svg`, with
descriptions fetched from GitHub in real time. UI, layouts, and styles follow the author's design draft.

## Architecture invariants
- **Isomorphic render**: `renderSvg(config)` is a pure function shared by the config-site preview
  and `/api/svg`. Never fork into two renderers.
- **URL is the state**: `config ↔ query` via `parseConfig` / `serializeConfig` is the single source
  of truth. The site initializes from the URL and writes config back to the address bar. Unknown
  enum-ish keys (`style` / `theme` / `variant`) fall back to defaults in `parseConfig`, so a serialized
  URL always faithfully describes what renders (never a bogus key the renderer silently ignores).
- **Stateless, no database**: the config site is a static frontend; the backend is the stateless
  `/api/*` routes; nothing is persisted. The site fetches repo metadata through `/api/repo` and
  `/api/discover`, which proxy GitHub server-side with a shared read-only PAT + cache (not direct from
  the browser).

## Stack
- Config site: React 19 + Vite + Tailwind v4 (warm-paper dual-theme tokens, Space Grotesk +
  JetBrains Mono web fonts — site UI only).
- Render: hand-built structured SVG (not satori) — CJK-aware width estimation, zero font payload
  on the edge worker.
- Server: one Hono app deployed to Cloudflare Workers or Vercel Edge (see Deploy).

## Output (design draft)
- Four `variant`s, all single-image: `full` (830 full width: eyebrow + title / big skills count /
  diamond rows + right-aligned descriptions + command chips) / `list` (495 half width, dense rows) /
  `grid` (640 two-column tiles) / `banner` (830 slim strip + short-name pill flow). Fifteen `style`s
  × light/dark `theme`: candy (the site's own neo-brutalist look, listed first in the picker) +
  claude / github / terminal / brutalist / blueprint / neon / editorial / minimal (values from the
  design-draft palettes) + gruvbox / nord / dracula / catppuccin (editor themes' official palettes) +
  vercel / codex (brand looks), all in `render/styles.ts`.
- `terminal` is a style, not a variant: with `style=terminal`, `full` renders as a terminal window
  (`➜ ~ npx skills add …` with prompt/path/arg coloring); other variants render normally with its
  mono palette. brutalist has a 2px border + 6px hard shadow bottom-right (the image expands to fit);
  blueprint overlays a `<pattern>` grid on the card face; editorial uses a system serif stack.
- The card count is the number of skills; stars are not rendered (the `stars` field is still fetched —
  the discover panel uses it).
- Install command defaults to `npx skills add {repo}` and is templatable (`cmd` param, `{repo}`
  placeholder — for repos that install via install.sh etc.). Per-repo description overrides via
  `d0..d23` indexed by skills order; serialize rewrites them on every change so indexes always match
  after reordering.
- The card is signed by its owner, not by this site: bottom-left `@{dominantOwner}`; no site-domain
  watermark on any variant — the card is the user's showcase.
- Every skill row/tile/pill/terminal-line is wrapped in an SVG `<a>` to its GitHub repo: clickable
  when the SVG is opened directly; inert-but-harmless inside a README `<img>` (camo makes images
  static — per-element clicks there are a platform impossibility).
- Transparent image background; the card face carries its own surface, so it sits naturally on any
  README background. Soft blur shadows stay out of the SVG (the site preview adds CSS drop-shadow);
  brutalist's hard shadow is the exception (solid block, drawn in).
- Export snippets come from `buildExportSnippets` (`render/snippet.ts`, pure): Markdown / HTML `<img>`
  (width per variant) / raw SVG URL. **The image's outer link points to this site with the same
  params** — SVGs in READMEs are unclickable and uncopyable, so visitors click the card back to the
  site to copy each command (the on-site CommandList is the landing spot). No more linking out to
  GitHub/skills.sh from the image.
- tspan boundary spaces get collapsed by XML whitespace handling (rsvg even eats `&#160;`): every
  multi-tspan colored `<text>` must carry `xml:space="preserve"`.

## Import
- The user pastes a skill repo (`owner/repo` or full GitHub URL via `parseRepo`), or a bare username /
  user URL (via `parseUser`) to discover that user's public repos and pick from them.
- Discovery (`/api/discover`) lists non-fork, non-archived repos and flags `isSkill`, strongest
  signal first: one code-search call (`filename:SKILL.md user:X` — SKILL.md is the de-facto standard
  marker; needs a token, degrades to heuristics with a log line, and only runs when the list is
  rebuilt so 304/cache paths don't burn search quota) → raw-CDN probe for root `SKILL.md` /
  `skills-lock.json` (tokenless, no API quota; only probes repos the other signals missed, budget-capped
  at 40 subrequests — CF Workers hard limit is 50 per request) → skill word-segment topics (including
  fused aliases like `openskills`) → skill word-segment names (prefix/middle/suffix all count) →
  high-signal descriptions (skill(s) + a domain word like claude/agent/ai/llm). Collection repos with
  only nested `skills/*/SKILL.md` (e.g. AkaraChen/eric-way) are only reachable through the code-search
  layer — production must set GITHUB_TOKEN.
  Recall-first: repos are selected by the user, never auto-added — false flags are cheap, misses are
  expensive. Sorts skills-first.
- The unit shown is a repo (one repo = one `npx skills add`).

## Security
- Every untrusted string entering the SVG goes through `escapeXml`.
- `owner/repo` goes through the `parseRepo` allowlist; all colors come from the `styles.ts` presets —
  the query accepts no color injection.
- `/api/svg` must send `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:`
  and `X-Content-Type-Options: nosniff`.
- The README-snippet builder (`buildExportSnippets`) escapes per output context: `escapeXml` for the HTML
  format (`<img>`/`<a>` href/src/alt), backslash-escaped brackets for Markdown image alt — so a title with
  `"` / `]` can't break or inject into the copied snippet.

## Fetch & cache
- `/api/svg` fetches GitHub live; on failure, degrade to a placeholder — never fail the whole image.
- Distinguish retryable failure (timeout / rate-limit / 5xx) from not-found (404); degraded responses
  use a short cache so transient failures aren't frozen. On failure with a stale cached value, serve
  the stale value (not degraded).
- Use ETag conditional requests to GitHub (`If-None-Match`); a `304` reuses cached metadata and does
  not count against the primary rate limit (when authorized). The PAT limit is per-account (all your
  tokens share one 5,000/h), so rely on caching + ETags, not multi-PAT rotation.
- Negative-cache misses (404 / retryable) briefly so fanned-out invalid repos/users don't re-hit
  GitHub. `/api/discover` is the most fan-out-able route (one list call) and **should** be throttled
  with an IP-keyed Cloudflare Rate Limiting rule (the single PAT limit is shared across all routes) —
  this is a deploy-time dashboard/WAF rule, not configured in-repo; Vercel Edge has no equivalent.
- `enrichSkills` fans out under one shared ~7s deadline passed to every GitHub fetch, so a hard
  GitHub outage degrades to a placeholder within bounded time instead of stacking per-call 5s timeouts.
- `Cache-Control: s-maxage` + `stale-while-revalidate`, tiered per route (stable repo metadata long, `discover`
  short); a single read-only PAT + strong cache.
- Camo re-hosts the SVG on GitHub's own CDN and holds it ~1 year; our `s-maxage` only governs our CDN, not camo.
  Camo only honors origin caching predictably when the response carries a validator, so `/api/svg` sends a
  content-hash `ETag` (and answers `If-None-Match` with `304`) — distinct from the upstream GitHub-API ETags,
  which serve the PAT rate limit. Live data renders on the first fetch only — treat the card as a static
  snapshot and never depend on post-load interactivity.

## Render
- Estimate text width with CJK / emoji weighting, never raw char count; truncate by code point.
  Monospace text measures at ~0.6em/char via `measureMono`; styles whose body font is mono
  (blueprint/terminal) measure at fontSize × 1.2 (`measureFs`) or proportional estimates under-count
  by ~20% and overflow.
- Render an empty state for 0 skills.
- Fonts: put a font stack directly on every `<text>` (from the current style token's `font` / `mono`,
  all system stacks). Never reference a web font in the SVG — camo blocks external fetches and an
  `<img>`-loaded SVG is an isolated document. The design draft's Space Grotesk / JetBrains Mono are
  config-site UI only.
- Accessibility: the root `<svg>` carries `role="img"` + `aria-label` + a `<title>` derived from the config,
  since a card embedded via `<img>` exposes only those to a screen reader.
- Light/dark is an explicit param (`theme=light|dark`); no in-SVG media queries (Safari ignores them,
  and behind camo there's no page theme to read).
- The install command is the product signature: `fitMono` (`svg.ts`) shrinks it to fit before truncating, so
  the repo never gets cut out of `npx skills add owner/repo`. Keep each SVG under camo's 5MB limit.

## Extend & test
- Add a style: append a light+dark token pair to `styles.ts` and register it in `STYLE_META` (site picker).
  Add a variant: implement it in `templates/` and register it in `templates/index.ts` (+ `VARIANT_WIDTH`).
- Shared `/api` response types live in `render/types.ts` (`RepoResponse`, `DiscoverRepo`), imported by both
  server and web.
- Tests (`src/**/*.test.ts`, vitest, node env): `renderSvg` snapshots (variant × style × theme, also asserting
  a11y attrs / XSS escaping / brutalist expansion / blueprint pattern / per-skill links / owner footer),
  query encode/decode + key validation (`cmd` template, `d{i}` overrides), `parseRepo`/`parseUser`/
  `formatStars`, `buildExportSnippets` (three formats / back-to-site links / escaping), `looksLikeSkill`
  heuristics, and web-layer pure logic (`skill-list`, `translate`).

## Deploy (Cloudflare Workers + Static Assets)
- Build with `@cloudflare/vite-plugin` (`cloudflare()` in `vite.config.ts`); local dev runs the real
  workerd runtime, matching production.
- In `wrangler.jsonc`, serve the SPA via `assets` with `not_found_handling: "single-page-application"`
  and `run_worker_first: ["/api/*"]`, so `/api/*` always hits the Worker while other routes fall back
  to `index.html`. Keep `observability.enabled: true`. Set a recent `compatibility_date`.
- Also deploys to Vercel from the same code: `vite.config.ts` drops the `cloudflare()` plugin when
  `process.env.VERCEL` is set (plain SPA → `dist/`), and `api/index.ts` (`export const config = { runtime:
  "edge" }`) serves the shared Hono app as an Edge Function, with `vercel.json` rewriting `/api/(.*)` to it.
  `getToken` reads `c.env` (CF binding) or `process.env` (Vercel/Node). The CF worker entry and the Vercel
  `api/` entry wrap one app — keep them in sync.
