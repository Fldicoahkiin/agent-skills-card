import type { ShowcaseConfig, StyleTokens } from "./types";
import { resolveStyle } from "./styles";
import { templates, defaultTemplate } from "./templates";
import { escapeXml } from "./svg";

// Isomorphic entry: config -> full SVG string. Both the site preview and /api/svg call this.
// Precondition: config.skills already enriched with name/description (on add in the site / server-side enrich).
// Transparent image background; the card face carries its own surface — sits naturally on any README background (the draft's floating-card look).
export function renderSvg(config: ShowcaseConfig): string {
  const tokens = resolveStyle(config.style, config.theme);
  if (config.skills.length === 0) return emptyState(tokens, config);

  const tpl = templates[config.variant] ?? defaultTemplate;
  const r = tpl.render(config, { tokens });

  const label = `${config.title || "My Agent Skills"} — ${config.skills.length} agent skill${config.skills.length > 1 ? "s" : ""}`;
  return svgDoc(r.width, r.height, r.defs ? [r.defs] : [], r.body, label);
}

// An SVG inside <img> is an isolated document; screen readers only see the root role/aria-label/<title>: derive a readable label from the config.
function svgDoc(width: number, height: number, defs: string[], body: string, label: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">` +
    `<title>${escapeXml(label)}</title>` +
    (defs.length ? `<defs>${defs.join("")}</defs>` : "") +
    body +
    "</svg>"
  );
}

// Empty state for 0 skills: styled dashed placeholder. /api/svg is a public endpoint, so the copy is English.
function emptyState(t: StyleTokens, config: ShowcaseConfig): string {
  const width = 495;
  const height = 96;
  const body =
    `<rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="${t.radiusSm}" fill="${t.surface}" stroke="${t.border}" stroke-width="1" stroke-dasharray="5 4"/>` +
    `<text x="${width / 2}" y="${height / 2 + 4}" text-anchor="middle" font-family="${t.font}" font-size="13" fill="${t.muted}">Add skill repos to render this card</text>`;
  return svgDoc(width, height, [], body, `${config.title || "My Agent Skills"} — empty`);
}

export type { ShowcaseConfig, SkillEntry, StyleTokens, Template, RepoResponse, DiscoverRepo } from "./types";
export { parseConfig, serializeConfig, DEFAULTS } from "./query";
export { STYLES, STYLE_META, resolveStyle } from "./styles";
export { templateList, VARIANT_WIDTH } from "./templates";
export { parseRepo, parseUser, repoName, repoOwner, buildInstall, formatStars } from "./skill";
export { buildExportSnippets, type ExportSnippets } from "./snippet";
