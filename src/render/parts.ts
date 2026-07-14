import type { SkillEntry, StyleTokens } from "./types";
import { escapeXml, fitMono, measureText } from "./svg";
import { repoOwner } from "./skill";

// Render atoms shared by all variants: card shell, install-command chip, count pill.

// Card shell: surface + border; brutalist first draws a 6px hard shadow bottom-right, blueprint overlays a grid on the surface.
// The returned totalW/totalH include the shadow expansion; templates report the image size from them.
export function cardShell(
  t: StyleTokens,
  w: number,
  h: number,
  radius: number,
): { svg: string; defs: string; totalW: number; totalH: number } {
  const sh = t.hardShadow ? 6 : 0;
  const parts: string[] = [];
  let defs = "";
  if (t.hardShadow) {
    parts.push(`<rect x="${sh}" y="${sh}" width="${w}" height="${h}" rx="${radius}" fill="${t.hardShadow}"/>`);
  }
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" rx="${radius}" fill="${t.surface}"/>`);
  if (t.grid) {
    // Blueprint grid: 1px lines every 22px both ways, clipped to the card's rounded corners.
    defs =
      `<pattern id="bp-grid" width="22" height="22" patternUnits="userSpaceOnUse">` +
      `<path d="M22 0H0V22" fill="none" stroke="${t.grid}" stroke-width="1"/></pattern>` +
      `<clipPath id="bp-clip"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>`;
    parts.push(`<rect width="${w}" height="${h}" fill="url(#bp-grid)" clip-path="url(#bp-clip)"/>`);
  }
  // Border drawn last so it stays crisp; inset by half the stroke so the viewport doesn't clip it.
  const i = t.bw / 2;
  parts.push(
    `<rect x="${i}" y="${i}" width="${w - t.bw}" height="${h - t.bw}" rx="${Math.max(0, radius - i)}" fill="none" stroke="${t.border}" stroke-width="${t.bw}"/>`,
  );
  return { svg: parts.join(""), defs, totalW: w + sh, totalH: h + sh };
}

// Install-command chip: accentSoft fill + border + command text. No copy icon drawn — a static image
// in a README can't deliver one. The `data-cmd` attribute is inert there but lets the on-site inline
// preview turn the chip into a click-to-copy target (see Preview.tsx).
export function installChip(
  t: StyleTokens,
  cmd: string,
  x: number,
  y: number,
  maxW: number,
  fs: number,
  h: number,
): { svg: string; w: number } {
  const padX = 10;
  const fit = fitMono(cmd, maxW - padX * 2, fs);
  const textW = fit.text.length * fit.fontSize * 0.6;
  const w = Math.min(maxW, padX * 2 + textW);
  const ty = y + h / 2 + fit.fontSize * 0.34;
  const svg =
    `<g data-cmd="${escapeXml(cmd)}">` +
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${Math.min(6, t.radiusSm)}" fill="${t.accentSoft}" stroke="${t.border}" stroke-width="1"/>` +
    `<text x="${(x + padX).toFixed(1)}" y="${ty.toFixed(1)}" font-family="${t.mono}" font-size="${fit.fontSize.toFixed(1)}" fill="${t.accentInk}">${escapeXml(fit.text)}</text>` +
    "</g>";
  return { svg, w };
}

// Count pill (right side of list/grid headers): accentSoft rounded fill + number.
export function countPill(t: StyleTokens, label: string, rightX: number, cy: number, fs: number): { svg: string; w: number } {
  const padX = fs < 11 ? 10 : 11;
  const w = padX * 2 + Math.ceil(measureText(label, fs));
  const h = fs + 11;
  const svg =
    `<rect x="${(rightX - w).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.accentSoft}"/>` +
    `<text x="${(rightX - w + padX).toFixed(1)}" y="${(cy + fs * 0.34).toFixed(1)}" font-family="${t.mono}" font-size="${fs}" font-weight="600" fill="${t.accentInk}">${escapeXml(label)}</text>`;
  return { svg, w };
}

// Body measurement font size: blueprint/terminal body text is monospace; the proportional model (~0.5em/char) under-counts
// ~20% and overflows (descriptions crash into names). Measure at fontSize ×1.2 (narrow 0.5→0.6, CJK 1.0→1.2, matching the mono cell)
// while rendering at the original size. Pass this fontSize to measureText/wrapText/truncateToWidth.
export function measureFs(t: StyleTokens, fs: number): number {
  return t.font === t.mono ? fs * 1.2 : fs;
}

// Short repo name (owner stripped). The draft's item.short.
export function shortName(repo: string): string {
  const i = repo.indexOf("/");
  return i > -1 ? repo.slice(i + 1) : repo;
}

// Description: user override first, then the GitHub description, then the fallback (draft: entry.desc || 'GitHub repository').
export function descOf(s: SkillEntry): string {
  return s.descOverride || s.description || "GitHub repository";
}

// Most frequent owner (ties go to the first seen). Signs the card bottom-left — the card is the user's showcase, so credit them, not this site.
export function dominantOwner(skills: SkillEntry[]): string {
  const count = new Map<string, number>();
  let best = "";
  let bestN = 0;
  for (const s of skills) {
    const o = repoOwner(s.repo);
    const n = (count.get(o) ?? 0) + 1;
    count.set(o, n);
    if (n > bestN) {
      best = o;
      bestN = n;
    }
  }
  return best;
}
