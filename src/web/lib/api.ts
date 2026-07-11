import type { RepoResponse } from "../../render";

// Shared /api/repo fetch: used by both add-repo and URL-open hydration.
// Distinguishes stable notfound from retryable error; callers pick their own copy/degradation.
export type RepoResult = { ok: true; meta: RepoResponse } | { ok: false; kind: "notfound" | "error" };

export async function fetchRepoMeta(repo: string): Promise<RepoResult> {
  try {
    const res = await fetch(`/api/repo?repo=${encodeURIComponent(repo)}`);
    if (!res.ok) return { ok: false, kind: res.status === 404 ? "notfound" : "error" };
    return { ok: true, meta: (await res.json()) as RepoResponse };
  } catch {
    return { ok: false, kind: "error" };
  }
}
