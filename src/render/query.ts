import type { ShowcaseConfig, SkillEntry } from "./types";
import { parseRepo, repoName } from "./skill";
import { STYLES } from "./styles";
import { templates } from "./templates";

export const DEFAULTS: ShowcaseConfig = {
  skills: [],
  title: null,
  style: "claude",
  theme: "light",
  variant: "full",
  installTemplate: "npx skills add {repo}",
  showDesc: true,
  showInstall: true,
};

const MAX_SKILLS = 24;

function bool(params: URLSearchParams, key: string, dflt: boolean): boolean {
  const raw = params.get(key);
  if (raw == null) return dflt;
  return raw === "1" || raw === "true";
}

// query -> config. All boundary validation happens here, once. skills carry repo ids only; name/description are filled by server-side enrich.
// style/variant must hit the registry and theme must be light|dark, else fall back to defaults — the URL always faithfully describes what renders.
// Per-repo description overrides use index-based d0..d23 (serialize rewrites them in current order, so indexes stay aligned after reorders).
export function parseConfig(params: URLSearchParams): ShowcaseConfig {
  const skills: SkillEntry[] = (params.get("skills") ?? "")
    .split(",")
    .map((s) => parseRepo(s))
    .filter((r): r is string => r != null)
    .slice(0, MAX_SKILLS)
    .map((repo, i) => {
      const d = params.get(`d${i}`);
      return { repo, name: repoName(repo), description: "", stars: null, ...(d ? { descOverride: d.slice(0, 140) } : {}) };
    });

  const titleRaw = params.get("title");
  const cmdRaw = params.get("cmd");
  const style = params.get("style");
  const theme = params.get("theme");
  const variant = params.get("variant");
  return {
    skills,
    title: titleRaw ? titleRaw.slice(0, 80) : null,
    style: style && style in STYLES ? style : DEFAULTS.style,
    theme: theme === "dark" ? "dark" : "light",
    variant: variant && variant in templates ? variant : DEFAULTS.variant,
    installTemplate: cmdRaw ? cmdRaw.slice(0, 120) : DEFAULTS.installTemplate,
    showDesc: bool(params, "desc", DEFAULTS.showDesc),
    showInstall: bool(params, "install", DEFAULTS.showInstall),
  };
}

// config -> query. Defaults omitted to keep URLs short. Encodes only repo ids and user overrides, never fetched metadata.
export function serializeConfig(c: ShowcaseConfig): string {
  const p = new URLSearchParams();
  if (c.skills.length) p.set("skills", c.skills.map((s) => s.repo).join(","));
  c.skills.forEach((s, i) => {
    if (s.descOverride) p.set(`d${i}`, s.descOverride);
  });
  if (c.title) p.set("title", c.title);
  if (c.style !== DEFAULTS.style) p.set("style", c.style);
  if (c.theme !== DEFAULTS.theme) p.set("theme", c.theme);
  if (c.variant !== DEFAULTS.variant) p.set("variant", c.variant);
  if (c.installTemplate !== DEFAULTS.installTemplate) p.set("cmd", c.installTemplate);
  if (!c.showDesc) p.set("desc", "0");
  if (!c.showInstall) p.set("install", "0");
  return p.toString();
}
