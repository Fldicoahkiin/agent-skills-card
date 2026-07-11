import { Hono } from "hono";
import { renderSvg, parseConfig, parseRepo, parseUser, type RepoResponse } from "../render";
import { enrichSkills, fetchRepo, discoverRepos } from "./github";

// One read-only PAT (no scopes; public repos suffice) lifts the anonymous 60/h limit to 5000/h.
export type Env = { GITHUB_TOKEN?: string };

// CF Workers has no process (typeof-guarded below); Vercel Edge / Node has process.env.
declare const process: { env?: Record<string, string | undefined> };

// Token works on both targets: CF via binding (c.env), Vercel/Node via process.env. Always optional (anonymous without it).
function getToken(env: Env): string | undefined {
  if (env?.GITHUB_TOKEN) return env.GITHUB_TOKEN;
  if (typeof process !== "undefined" && process.env?.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return undefined;
}

// Content-hash ETag (FNV-1a): camo only honors origin caching predictably when the response carries a validator (ETag/Last-Modified);
// Cache-Control alone gets over-cached. Distinct from the upstream GitHub-API ETags, which serve the PAT rate limit.
function etagOf(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `"${(h >>> 0).toString(16)}"`;
}

const app = new Hono<{ Bindings: Env }>();

// The showcase image. The query picks the repos; the server fills stars/descriptions live. Failures degrade, and the cache shortens with them.
app.get("/api/svg", async (c) => {
  const config = parseConfig(new URL(c.req.url).searchParams);

  let svgConfig = config;
  let degraded = false;
  if (config.skills.length) {
    // Boundary net: if enrich throws (e.g. GitHub 200 with a non-JSON body), degrade to placeholder data —
    // never 500: a bad response would be frozen by camo's long cache.
    try {
      const r = await enrichSkills(config.skills, { token: getToken(c.env) });
      svgConfig = { ...config, skills: r.skills };
      degraded = r.degraded;
    } catch {
      degraded = true;
    }
  }

  const svg = renderSvg(svgConfig);
  const cache = degraded
    ? "public, max-age=60, s-maxage=120, stale-while-revalidate=300"
    : "public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400";
  const etag = etagOf(svg);

  // 304 when the content is unchanged (camo / CDN reuse), skipping the transfer.
  if (c.req.header("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { "cache-control": cache, etag, "access-control-allow-origin": "*" } });
  }

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": cache,
      etag,
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      "x-content-type-options": "nosniff",
      "access-control-allow-origin": "*",
    },
  });
});

// Config site: fetch one repo's metadata. RepoResponse is shared with web; cached so it doesn't punch through to GitHub every time.
app.get("/api/repo", async (c) => {
  const repo = parseRepo(c.req.query("repo") ?? "");
  if (!repo) return c.json({ error: "bad repo" }, 400);
  const r = await fetchRepo(repo, getToken(c.env));
  if (!r.ok) {
    return c.json({ error: r.kind }, r.kind === "notfound" ? 404 : 502, { "cache-control": "public, max-age=60" });
  }
  const body: RepoResponse = { ...r.meta };
  return c.json(body, 200, {
    "access-control-allow-origin": "*",
    "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400",
  });
});

// Config site: given a username, list their public repos for picking (skill repos flagged and sorted first).
app.get("/api/discover", async (c) => {
  const user = parseUser(c.req.query("user") ?? "");
  if (!user) return c.json({ error: "bad user" }, 400);
  const r = await discoverRepos(user, getToken(c.env));
  if (!r.ok) {
    return c.json({ error: r.kind }, r.kind === "notfound" ? 404 : 502, { "cache-control": "public, max-age=60" });
  }
  return c.json(r.repos, 200, {
    "access-control-allow-origin": "*",
    "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
  });
});

export default app;
