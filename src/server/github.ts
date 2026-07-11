import type { SkillEntry, DiscoverRepo } from "../render";

const GH = "https://api.github.com";

// —— Skill-repo detection (heuristics; pure functions, exported for tests) ——
// Signals: skill word-segment topics (claude-skills / skill-library / fused aliases like openskills) /
// skill word-segment names (prefix/middle/suffix all count: skill-example, my-skill-pack, agent-skills) /
// descriptions mentioning both skill(s) and claude/agent/anthropic/llm/ai/SKILL.md.
// Recall-first: repos are picked by the user and never auto-added — false-flagging a tool repo costs far less than missing a real skill.
// Real skill repos with no skill in name/topic/description (e.g. obra/superpowers) are caught by the SKILL.md
// code search (see searchSkillMd).
const TOPIC_SKILL = /(^|-)skills?(-|$)/;
const TOPIC_FUSED = new Set(["openskills", "agentskills", "claudeskills", "aiskills"]);
const NAME_SKILL = /(^|[-_.])skills?([-_.]|$)/i;

export function looksLikeSkill(name: string, description: string, topics: string[]): boolean {
  if (topics.some((t) => TOPIC_SKILL.test(t) || TOPIC_FUSED.has(t))) return true;
  if (NAME_SKILL.test(name)) return true;
  const d = description.toLowerCase();
  return /\bskills?\b/.test(d) && /(claude|agent|anthropic|llm|skill\.md|\bai\b)/.test(d);
}

// Per-isolate in-memory cache. Fresh entries hit directly; stale ones revalidate via conditional ETag requests. Size-capped against unbounded growth.
const TTL = 10 * 60 * 1000;
const CACHE_MAX = 500;
const repoCache = new Map<string, { at: number; etag?: string; v: RepoMeta }>();
const discoverCache = new Map<string, { at: number; etag?: string; v: DiscoverRepo[] }>();

// Negative cache: briefly remember 404s / retryable failures so the same key doesn't re-hit origin (fan-out over invalid users/repos would drain the PAT).
const NEG_TTL = 60 * 1000;
const negCache = new Map<string, { at: number; kind: "notfound" | "retryable" }>();
function negGet(key: string): "notfound" | "retryable" | null {
  const n = negCache.get(key);
  return n && Date.now() - n.at < NEG_TTL ? n.kind : null;
}
function negSet(key: string, kind: "notfound" | "retryable"): void {
  capSet(negCache, key, { at: Date.now(), kind });
}

// Size cap + FIFO eviction (Map keeps insertion order; drop the oldest key).
function capSet<V>(map: Map<string, V>, key: string, val: V): void {
  if (map.size >= CACHE_MAX && !map.has(key)) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) map.delete(oldest);
  }
  map.set(key, val);
}

// Concurrency pool: at most `limit` in flight, so 24 repos don't burst into ~48 parallel GitHub calls.
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

// Only these GitHub API fields are read; external and untrusted, so extract them explicitly at the boundary.
type GhRepo = {
  name?: string;
  full_name?: string;
  description?: string | null;
  stargazers_count?: number;
};

export type RepoMeta = { repo: string; name: string; description: string; stars: number };

// Distinguish stable not-found (404) from retryable failure (timeout / rate limit / 5xx); cache duration follows from it.
type FetchResult = { ok: true; meta: RepoMeta } | { ok: false; kind: "notfound" | "retryable" };

function ghHeaders(token?: string, etag?: string): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": "agent-skills-card",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  if (etag) h["If-None-Match"] = etag;
  return h;
}

// deadline: enrich's fan-out passes one shared total-budget signal, so a hard GitHub outage degrades the whole round in bounded time instead of stacking per-wave timeouts.
async function ghFetch(path: string, headers: Record<string, string>, timeoutMs = 5000, deadline?: AbortSignal): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const signal = deadline ? AbortSignal.any([ctrl.signal, deadline]) : ctrl.signal;
  try {
    return await fetch(`${GH}${path}`, { headers, signal });
  } catch {
    return null; // network error / timeout / shared deadline expired
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchRepo(full: string, token?: string, deadline?: AbortSignal): Promise<FetchResult> {
  const cached = repoCache.get(full);
  if (cached && Date.now() - cached.at < TTL) return { ok: true, meta: cached.v };
  const neg = negGet(`r:${full}`);
  if (neg) return { ok: false, kind: neg };

  // Stale entries revalidate with a conditional ETag request: a 304 (unchanged; needs Authorization) doesn't count against the primary limit and just renews the entry.
  const res = await ghFetch(`/repos/${full}`, ghHeaders(token, cached?.etag), 5000, deadline);
  if (res === null) {
    if (cached) return { ok: true, meta: cached.v };
    negSet(`r:${full}`, "retryable");
    return { ok: false, kind: "retryable" };
  }
  if (res.status === 304 && cached) {
    cached.at = Date.now();
    return { ok: true, meta: cached.v };
  }
  if (res.status === 404) {
    repoCache.delete(full);
    negSet(`r:${full}`, "notfound");
    return { ok: false, kind: "notfound" };
  }
  // Other failures (403/429/5xx): fall back to stale data when present (not counted as degraded), else retryable.
  if (!res.ok) {
    if (cached) return { ok: true, meta: cached.v };
    negSet(`r:${full}`, "retryable");
    return { ok: false, kind: "retryable" };
  }

  const j = (await res.json()) as GhRepo;
  const meta: RepoMeta = {
    repo: full,
    name: j.name ?? full.split("/")[1] ?? full,
    description: j.description ?? "",
    stars: j.stargazers_count ?? 0,
  };
  capSet(repoCache, full, { at: Date.now(), etag: res.headers.get("etag") ?? undefined, v: meta });
  return { ok: true, meta };
}

// Enrich SkillEntry[] and report degradation: any retryable failure (with no stale data) = degraded (short cache, so a transient
// outage isn't frozen in); 404s aren't degradation (stable result). Unfetchable entries keep their values. Concurrency-limited.
export async function enrichSkills(
  skills: SkillEntry[],
  opts: { token?: string } = {},
): Promise<{ skills: SkillEntry[]; degraded: boolean }> {
  // Total budget for the enrich round: under a hard GitHub outage, per-wave 5s timeouts would stack to ~20-40s and the platform would 5xx us.
  // A shared deadline degrades the round into a placeholder image within bounded time instead of failing the whole image.
  const dl = new AbortController();
  const dlTimer = setTimeout(() => dl.abort(), 7000);
  let degraded = false;
  try {
    const results = await mapPool(skills, 6, (s) => fetchRepo(s.repo, opts.token, dl.signal));

    const enriched = skills.map((s, i) => {
      const r = results[i];
      if (r.ok) {
        return {
          ...s,
          name: s.name || r.meta.name,
          description: s.description || r.meta.description,
          stars: r.meta.stars,
        };
      }
      if (r.kind === "retryable") degraded = true;
      return s;
    });

    return { skills: enriched, degraded };
  } finally {
    clearTimeout(dlTimer);
  }
}

type GhListRepo = GhRepo & { archived?: boolean; fork?: boolean; topics?: string[] };

// One code search lists every repo of the user containing SKILL.md — the de-facto standard marker of an agent skill;
// it catches repos whose name/topic/description never mention skill. Code search requires auth and has its own quota (~30/min):
// with no token, or on failure, return null — detection degrades to pure heuristics with a log line (never fails the request). Cached with discover.
async function searchSkillMd(user: string, token?: string): Promise<Set<string> | null> {
  if (!token) return null;
  const q = encodeURIComponent(`user:${user} filename:SKILL.md`);
  const res = await ghFetch(`/search/code?q=${q}&per_page=100`, ghHeaders(token));
  if (!res || !res.ok) {
    console.warn(`discover ${user}: SKILL.md code search degraded (${res ? res.status : "network"})`);
    return null;
  }
  try {
    const j = (await res.json()) as { items?: { repository?: { full_name?: string } }[] };
    const set = new Set<string>();
    for (const it of j.items ?? []) {
      const fn = it.repository?.full_name;
      if (fn) set.add(fn.toLowerCase());
    }
    return set;
  } catch {
    console.warn(`discover ${user}: SKILL.md code search bad payload`);
    return null;
  }
}

// Tokenless fallback: probe the raw CDN for a root SKILL.md or skills-lock.json (the skills CLI lockfile).
// raw.githubusercontent.com consumes no API quota; only repos the other signals missed get probed. Nested SKILL.md
// (collection repos) is invisible to this layer and still needs the code search (token required).
// CF Workers allow at most 50 subrequests per request: give the probe a budget, spent in pushed order (newest first).
const PROBE_FILES = ["SKILL.md", "skills-lock.json"];
const PROBE_BUDGET = 40;

async function probeSkillFiles(repos: string[]): Promise<Set<string>> {
  const hit = new Set<string>();
  let budget = PROBE_BUDGET;
  const queue = [...repos];
  const worker = async () => {
    while (queue.length) {
      const repo = queue.shift()!;
      for (const f of PROBE_FILES) {
        if (budget <= 0) return;
        budget--;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 3000);
        try {
          const res = await fetch(`https://raw.githubusercontent.com/${repo}/HEAD/${f}`, { method: "HEAD", signal: ctrl.signal });
          if (res.ok) {
            hit.add(repo.toLowerCase());
            break; // one hit is enough; save the budget
          }
        } catch {
          // network errors count as a miss
        } finally {
          clearTimeout(timer);
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, repos.length) }, worker));
  return hit;
}

// List a user's public repos (non-fork, non-archived), flag skill repos, sort skills first, then stars descending.
export async function discoverRepos(
  user: string,
  token?: string,
): Promise<{ ok: true; repos: DiscoverRepo[] } | { ok: false; kind: "notfound" | "retryable" }> {
  // GitHub usernames are case-insensitive: cache/negative-cache keys normalize to lowercase to avoid duplicate entries and missed ETags.
  const key = user.toLowerCase();
  const cached = discoverCache.get(key);
  if (cached && Date.now() - cached.at < TTL) return { ok: true, repos: cached.v };
  const neg = negGet(`u:${key}`);
  if (neg) return { ok: false, kind: neg };

  const res = await ghFetch(`/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&type=owner`, ghHeaders(token, cached?.etag));
  if (res === null) {
    if (cached) return { ok: true, repos: cached.v };
    negSet(`u:${key}`, "retryable");
    return { ok: false, kind: "retryable" };
  }
  if (res.status === 304 && cached) {
    cached.at = Date.now();
    return { ok: true, repos: cached.v };
  }
  if (res.status === 404) {
    discoverCache.delete(key);
    negSet(`u:${key}`, "notfound");
    return { ok: false, kind: "notfound" };
  }
  if (!res.ok) {
    if (cached) return { ok: true, repos: cached.v };
    negSet(`u:${key}`, "retryable");
    return { ok: false, kind: "retryable" };
  }

  const arr = (await res.json()) as GhListRepo[];
  // SKILL.md hit set (the decisive signal). Called serially after the list succeeds: 304/cache paths never burn search quota.
  const skillMd = await searchSkillMd(user, token);
  const repos: DiscoverRepo[] = arr
    .filter((r) => !r.fork && !r.archived && r.full_name)
    .map((r) => {
      const full = r.full_name as string;
      const name = r.name ?? "";
      const topics = Array.isArray(r.topics) ? r.topics : [];
      const description = (r.description ?? "").slice(0, 280);
      const isSkill = (skillMd?.has(full.toLowerCase()) ?? false) || looksLikeSkill(name, description, topics);
      return { repo: full, name, description, stars: r.stargazers_count ?? 0, isSkill };
    });
  // Probe raw (root SKILL.md / skills-lock.json) for repos still unflagged — the tokenless fallback. The list is sorted by pushed, so newer repos spend the budget first.
  const probed = await probeSkillFiles(repos.filter((r) => !r.isSkill).map((r) => r.repo));
  for (const r of repos) if (!r.isSkill && probed.has(r.repo.toLowerCase())) r.isSkill = true;
  repos.sort((a, b) => (a.isSkill === b.isSkill ? b.stars - a.stars : a.isSkill ? -1 : 1));

  capSet(discoverCache, key, { at: Date.now(), etag: res.headers.get("etag") ?? undefined, v: repos });
  return { ok: true, repos };
}
