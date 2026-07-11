import { describe, it, expect } from "vitest";
import { looksLikeSkill } from "./github";

const bySkillName = (name: string) => looksLikeSkill(name, "", []);
const byTopic = (topic: string) => looksLikeSkill("repo", "", [topic]);
const byDesc = (desc: string) => looksLikeSkill("repo", desc, []);

describe("looksLikeSkill", () => {
  it("name with a skill word segment: prefix/middle/suffix all count (the old rule only matched the end)", () => {
    expect(bySkillName("skills")).toBe(true);
    expect(bySkillName("agent-skills")).toBe(true);
    expect(bySkillName("skill-example")).toBe(true); // missed by the old rule
    expect(bySkillName("my-skill-pack")).toBe(true); // missed by the old rule
    expect(bySkillName("skills-collection")).toBe(true); // missed by the old rule
    expect(bySkillName("SKILL-Demo")).toBe(true); // case-insensitive
    expect(bySkillName("dot.skills.repo")).toBe(true);
  });

  it("name does not false-flag non-segment substrings", () => {
    expect(bySkillName("reskill")).toBe(false);
    expect(bySkillName("skillet")).toBe(false);
    expect(bySkillName("haskell-utils")).toBe(false);
  });

  it("topic with a skill word segment or fused alias", () => {
    expect(byTopic("claude-skills")).toBe(true);
    expect(byTopic("skill")).toBe(true);
    expect(byTopic("ai-skills")).toBe(true);
    expect(byTopic("skill-library")).toBe(true);
    expect(byTopic("openskills")).toBe(true); // fused alias
    expect(byTopic("upskilling")).toBe(false);
  });

  it("description needs both skill(s) and a domain word, so generic skills do not false-flag", () => {
    expect(byDesc("A collection of agent skills for Claude")).toBe(true);
    expect(byDesc("Ships SKILL.md files for Claude Code")).toBe(true);
    expect(byDesc("Improve your coding skills")).toBe(false); // no domain word
    expect(byDesc("An agent framework")).toBe(false); // no skill mention
  });

  it("false when all three signals miss (such real skill repos are caught by the SKILL.md code search)", () => {
    expect(looksLikeSkill("superpowers", "Give your agent superpowers", [])).toBe(false);
  });
});
