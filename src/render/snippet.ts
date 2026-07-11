import type { ShowcaseConfig } from "./types";
import { serializeConfig } from "./query";
import { VARIANT_WIDTH } from "./templates";
import { escapeXml } from "./svg";

// The three README-embeddable snippet shapes (Markdown / HTML / URL). Pure function, decoupled from SVG rendering.
// The image's outer link points back to this site with the same params — SVGs in a README are unclickable and uncopyable,
// so visitors click the card to land back on the site and copy each npx command (the loop the draft settled on, replacing GitHub links).
export type ExportSnippets = { md: string; html: string; url: string };

// Escape brackets in the Markdown image alt so a ] in the title can't cut `[![title](...)]` short.
function mdAlt(s: string): string {
  return s.replace(/[[\]]/g, "\\$&");
}

// Assemble the config into README snippets. Returns null with no skills.
export function buildExportSnippets(config: ShowcaseConfig, origin: string): ExportSnippets | null {
  if (!config.skills.length) return null;

  const q = serializeConfig(config);
  const svgUrl = `${origin}/api/svg${q ? `?${q}` : ""}`;
  const pageUrl = `${origin}/${q ? `?${q}` : ""}`;
  const title = config.title || "My Agent Skills";
  const width = VARIANT_WIDTH[config.variant] ?? 830;

  const md = `[![${mdAlt(title)}](${svgUrl})](${pageUrl})`;
  const html = `<a href="${escapeXml(pageUrl)}">\n  <img src="${escapeXml(svgUrl)}" alt="${escapeXml(title)}" width="${width}" />\n</a>`;
  return { md, html, url: svgUrl };
}
