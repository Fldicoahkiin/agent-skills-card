import type { SkillEntry } from "../../render";

// Pure operations on the selected-skills list. GitHub repo ids are case-insensitive → dedupe on lowercase.
// Split from SkillInput's rendering for unit testing (dedupe / add / remove).

type RepoLike = { repo: string; name: string; description: string; stars: number };

export function hasRepo(skills: SkillEntry[], repo: string): boolean {
  const k = repo.toLowerCase();
  return skills.some((s) => s.repo.toLowerCase() === k);
}

export function toEntry(r: RepoLike): SkillEntry {
  return { repo: r.repo, name: r.name, description: r.description, stars: r.stars };
}

// Returns the same reference when already present, so callers can detect no-change.
export function addRepo(skills: SkillEntry[], r: RepoLike): SkillEntry[] {
  return hasRepo(skills, r.repo) ? skills : [...skills, toEntry(r)];
}

export function removeRepo(skills: SkillEntry[], repo: string): SkillEntry[] {
  const k = repo.toLowerCase();
  return skills.filter((s) => s.repo.toLowerCase() !== k);
}

export function reorder(skills: SkillEntry[], from: number, to: number): SkillEntry[] {
  if (from === to) return skills;
  const next = [...skills];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

// Set/clear a repo's custom description (empty string = clear, falling back to the GitHub description).
export function setDescOverride(skills: SkillEntry[], repo: string, v: string): SkillEntry[] {
  const k = repo.toLowerCase();
  return skills.map((s) => {
    if (s.repo.toLowerCase() !== k) return s;
    const { descOverride: _drop, ...rest } = s;
    return v.trim() ? { ...rest, descOverride: v.trim() } : rest;
  });
}

// Add every skill repo at once: only isSkill, deduped append.
export function addAllSkills(skills: SkillEntry[], repos: (RepoLike & { isSkill: boolean })[]): SkillEntry[] {
  let next = skills;
  for (const r of repos) if (r.isSkill) next = addRepo(next, r);
  return next;
}
