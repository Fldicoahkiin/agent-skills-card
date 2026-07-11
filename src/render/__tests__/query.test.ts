import { describe, it, expect } from "vitest";
import { parseConfig, serializeConfig, DEFAULTS } from "../index";

describe("query encode/decode", () => {
  it("default config serializes to an empty string", () => {
    expect(serializeConfig(DEFAULTS)).toBe("");
  });

  it("round-trips faithfully", () => {
    const cfg = {
      ...DEFAULTS,
      style: "brutalist",
      theme: "dark" as const,
      variant: "grid",
      title: "Hi",
      showDesc: false,
      skills: [{ repo: "a/b", name: "b", description: "", stars: null }],
    };
    const back = parseConfig(new URLSearchParams(serializeConfig(cfg)));
    expect(back.style).toBe("brutalist");
    expect(back.theme).toBe("dark");
    expect(back.variant).toBe("grid");
    expect(back.title).toBe("Hi");
    expect(back.showDesc).toBe(false);
    expect(back.skills.map((s) => s.repo)).toEqual(["a/b"]);
  });

  it("invalid repos are filtered out", () => {
    const back = parseConfig(new URLSearchParams("skills=anthropics/skills,not-a-repo,/bad"));
    expect(back.skills.map((s) => s.repo)).toEqual(["anthropics/skills"]);
  });

  it("invalid style/theme/variant fall back to defaults", () => {
    const back = parseConfig(new URLSearchParams("style=bogus&theme=nope&variant=nah"));
    expect(back.style).toBe(DEFAULTS.style);
    expect(back.theme).toBe("light");
    expect(back.variant).toBe(DEFAULTS.variant);
  });

  it("desc/install toggles round-trip", () => {
    expect(serializeConfig({ ...DEFAULTS, showInstall: false })).toContain("install=0");
    expect(parseConfig(new URLSearchParams("install=0")).showInstall).toBe(false);
    expect(parseConfig(new URLSearchParams("desc=0")).showDesc).toBe(false);
    expect(parseConfig(new URLSearchParams()).showDesc).toBe(true);
  });

  it("cmd template round-trips, omitted at default", () => {
    expect(serializeConfig(DEFAULTS)).not.toContain("cmd=");
    const q = serializeConfig({ ...DEFAULTS, installTemplate: "curl -fsSL https://x/{repo}/install.sh | sh" });
    const back = parseConfig(new URLSearchParams(q));
    expect(back.installTemplate).toBe("curl -fsSL https://x/{repo}/install.sh | sh");
  });

  it("d{i} overrides round-trip by index, commas included", () => {
    const cfg = {
      ...DEFAULTS,
      skills: [
        { repo: "a/b", name: "b", description: "", stars: null },
        { repo: "c/d", name: "d", description: "", stars: null, descOverride: "自定义, 带逗号" },
      ],
    };
    const back = parseConfig(new URLSearchParams(serializeConfig(cfg)));
    expect(back.skills[0].descOverride).toBeUndefined();
    expect(back.skills[1].descOverride).toBe("自定义, 带逗号");
  });
});
