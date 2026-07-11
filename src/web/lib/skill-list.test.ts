import { describe, it, expect } from "vitest";
import { hasRepo, addRepo, removeRepo, reorder, setDescOverride, addAllSkills } from "./skill-list";
import type { SkillEntry } from "../../render";

const e = (repo: string): SkillEntry => ({ repo, name: repo.split("/")[1], description: "", stars: 0 });
const r = (repo: string, isSkill = true) => ({ repo, name: repo.split("/")[1], description: "", stars: 0, isSkill });

describe("skill-list", () => {
  it("hasRepo is case-insensitive", () => {
    expect(hasRepo([e("A/B")], "a/b")).toBe(true);
    expect(hasRepo([e("A/B")], "a/c")).toBe(false);
  });

  it("addRepo dedupes case-insensitively; returns the same reference when present", () => {
    const s1 = addRepo([], r("a/b"));
    expect(s1.map((x) => x.repo)).toEqual(["a/b"]);
    expect(addRepo(s1, r("A/B"))).toBe(s1); // same reference = no change
  });

  it("removeRepo is case-insensitive", () => {
    expect(removeRepo([e("a/b"), e("c/d")], "A/B").map((x) => x.repo)).toEqual(["c/d"]);
  });

  it("addAllSkills adds only isSkill repos, deduped", () => {
    const repos = [r("a/b", true), r("c/d", false), r("a/b", true)];
    expect(addAllSkills([], repos).map((x) => x.repo)).toEqual(["a/b"]);
  });

  it("reorder moves; from===to returns the same reference", () => {
    const s = [e("a/b"), e("c/d"), e("e/f")];
    expect(reorder(s, 0, 2).map((x) => x.repo)).toEqual(["c/d", "e/f", "a/b"]);
    expect(reorder(s, 1, 1)).toBe(s);
  });

  it("setDescOverride sets and clears the custom description", () => {
    const s = [e("a/b")];
    const set = setDescOverride(s, "A/B", "  custom  ");
    expect(set[0].descOverride).toBe("custom");
    expect(setDescOverride(set, "a/b", "")[0].descOverride).toBeUndefined();
  });
});
