import { describe, it, expect } from "vitest";
import { buildExportSnippets, DEFAULTS } from "../index";
import type { SkillEntry } from "../index";

const ORIGIN = "https://x.test";
const sk = (repo: string): SkillEntry => ({ repo, name: repo.split("/")[1], description: "", stars: null });

describe("buildExportSnippets", () => {
  it("returns null with no skills", () => {
    expect(buildExportSnippets({ ...DEFAULTS, skills: [] }, ORIGIN)).toBeNull();
  });

  it("md: image points at /api/svg, outer link at this site with params (the copy-back loop)", () => {
    const s = buildExportSnippets({ ...DEFAULTS, title: "My Skills", skills: [sk("a/b"), sk("c/d")] }, ORIGIN);
    expect(s?.md).toContain("](https://x.test/api/svg?");
    expect(s?.md).toContain(")](https://x.test/?");
    expect(s?.md).toContain("skills=a%2Fb%2Cc%2Fd");
  });

  it("html: width follows the variant (list=400)", () => {
    const s = buildExportSnippets({ ...DEFAULTS, variant: "list", skills: [sk("a/b")] }, ORIGIN);
    expect(s?.html).toContain('width="400"');
    expect(s?.html).toContain('<a href="https://x.test/?');
  });

  it("url: direct SVG link", () => {
    const s = buildExportSnippets({ ...DEFAULTS, skills: [sk("a/b")] }, ORIGIN);
    expect(s?.url.startsWith("https://x.test/api/svg?")).toBe(true);
  });

  it("alt/title escaping: backslashed brackets in Markdown, escaped quotes in HTML", () => {
    const s = buildExportSnippets({ ...DEFAULTS, title: 'A]B"C', skills: [sk("a/b")] }, ORIGIN);
    expect(s?.md).toContain("A\\]B"); // ] is backslash-escaped and cannot cut the image syntax short
    expect(s?.html).toContain("A]B&quot;C"); // " → &quot;, safe in HTML attributes
  });
});
