import { describe, it, expect } from "vitest";
import { renderSvg, DEFAULTS, STYLES, templateList } from "../index";
import type { SkillEntry } from "../index";

const sample: SkillEntry[] = [
  { repo: "anthropics/skills", name: "skills", description: "Public repository for Agent Skills", stars: 4200 },
  { repo: "vercel-labs/agent-skills", name: "agent-skills", description: "Vercel's official collection of agent skills", stars: 1100 },
  { repo: "Fldicoahkiin/skill-example", name: "skill-example", description: "", stars: null },
];

// Variant × style × theme snapshots: every combination yields valid SVG with stable output (regression guard).
describe("renderSvg snapshots", () => {
  for (const tpl of templateList) {
    for (const style of Object.keys(STYLES)) {
      for (const theme of ["light", "dark"] as const) {
        it(`${tpl.key} × ${style} × ${theme}`, () => {
          const svg = renderSvg({ ...DEFAULTS, variant: tpl.key, style, theme, skills: sample });
          expect(svg.startsWith("<svg")).toBe(true);
          expect(svg).toContain("</svg>");
          expect(svg).toMatchSnapshot();
        });
      }
    }
  }
});

describe("renderSvg edge cases", () => {
  it("0 skills renders the empty state instead of crashing", () => {
    const svg = renderSvg({ ...DEFAULTS, skills: [] });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("Add skill repos");
  });

  it("root element carries role/aria-label/title for a11y", () => {
    const svg = renderSvg({ ...DEFAULTS, title: "My Skills", skills: sample });
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="My Skills — 3 agent skills"');
    expect(svg).toContain("<title>My Skills — 3 agent skills</title>");
  });

  it("terminal style renders a terminal window on full", () => {
    const svg = renderSvg({ ...DEFAULTS, style: "terminal", skills: sample });
    expect(svg).toContain("#ff5f57"); // traffic lights
    expect(svg).toContain("skills ready");
  });

  it("brutalist expands the image to fit the hard shadow", () => {
    const plain = renderSvg({ ...DEFAULTS, variant: "list", skills: sample });
    const brut = renderSvg({ ...DEFAULTS, variant: "list", style: "brutalist", skills: sample });
    const w = (s: string) => Number(/width="(\d+)"/.exec(s)?.[1]);
    expect(w(brut)).toBe(w(plain) + 6);
  });

  it("blueprint overlays a grid pattern on the card face", () => {
    const svg = renderSvg({ ...DEFAULTS, style: "blueprint", skills: sample });
    expect(svg).toContain('<pattern id="bp-grid"');
    expect(svg).toContain('fill="url(#bp-grid)"');
  });

  it("the command is the product signature: full has npx skills add per repo", () => {
    const svg = renderSvg({ ...DEFAULTS, skills: sample });
    expect(svg).toContain("npx skills add anthropics/skills");
    expect(svg).toContain("npx skills add vercel-labs/agent-skills");
  });

  it("custom command template and description overrides render", () => {
    const svg = renderSvg({
      ...DEFAULTS,
      installTemplate: "sh install.sh {repo}",
      skills: [{ repo: "a/b", name: "b", description: "原始", descOverride: "自定义描述", stars: null }],
    });
    expect(svg).toContain("sh install.sh a/b");
    expect(svg).toContain("自定义描述");
    expect(svg).not.toContain("原始");
  });

  it("every skill is wrapped in an <a> to its repo (clickable on direct open; inert inside a README img)", () => {
    for (const variant of ["full", "list", "grid", "banner"]) {
      const svg = renderSvg({ ...DEFAULTS, variant, skills: sample });
      expect(svg).toContain('<a href="https://github.com/anthropics/skills" target="_blank">');
      expect(svg).toContain('<a href="https://github.com/vercel-labs/agent-skills" target="_blank">');
    }
    const term = renderSvg({ ...DEFAULTS, style: "terminal", skills: sample });
    expect(term).toContain('<a href="https://github.com/anthropics/skills" target="_blank">');
  });

  it("card signed @owner, no site-domain watermark", () => {
    for (const variant of ["full", "list", "grid", "banner"]) {
      const svg = renderSvg({ ...DEFAULTS, variant, skills: sample });
      expect(svg).not.toContain("agent-skills-card.flacier.com");
    }
    expect(renderSvg({ ...DEFAULTS, skills: sample })).toContain("@anthropics"); // one vote each, tie goes to the first seen
  });

  it("showInstall=false renders no commands", () => {
    const svg = renderSvg({ ...DEFAULTS, skills: sample, showInstall: false });
    expect(svg).not.toContain("npx skills add");
  });

  it("untrusted text is escaped", () => {
    const svg = renderSvg({
      ...DEFAULTS,
      title: '<script>"&',
      skills: [{ repo: "a/b", name: "<b>", description: "x & y", stars: 1 }],
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
