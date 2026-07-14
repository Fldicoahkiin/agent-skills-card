import type { Template } from "../types";
import { escapeXml, truncateToWidth, truncateMono } from "../svg";
import { buildInstall } from "../skill";
import { cardShell, diamond, installChip, countPill, measureFs, shortName } from "../parts";

// Variant List: 495 half width, dense single-line rows. Header = title + count pill; row = diamond + short name + command chip on the right.
// Compact half-width, dense rows. No footer credit line (half width is precious).
const W = 495;
const PX = 20;
const ROW_H = 33;

export const list: Template = {
  key: "list",
  render(config, ctx) {
    const t = ctx.tokens;
    const title = config.title || "My Agent Skills";
    const innerW = W - PX * 2;

    const headH = 18 + 22 + 10;
    const rowsH = config.skills.length * ROW_H;
    const cardH = headH + rowsH + 16;

    const shell = cardShell(t, W, cardH, t.radiusSm);
    const parts: string[] = [shell.svg];

    // Header: title + count pill.
    const headCy = 18 + 11;
    const pill = countPill(t, String(config.skills.length), W - PX, headCy, 11);
    parts.push(pill.svg);
    parts.push(
      `<text x="${PX}" y="${(headCy + 16 * 0.34).toFixed(1)}" font-family="${t.font}" font-size="16" font-weight="700" fill="${t.ink}">${escapeXml(truncateToWidth(title, measureFs(t, 16), innerW - pill.w - 12))}</text>`,
    );

    // Rows (each wrapped in an <a>: clickable to its repo when the SVG is opened directly; static and harmless behind camo in a README)
    let y = headH;
    for (const s of config.skills) {
      parts.push(`<line x1="${PX - 6}" y1="${y.toFixed(1)}" x2="${W - PX + 6}" y2="${y.toFixed(1)}" stroke="${t.divider}" stroke-width="1"/>`);
      const cy = y + ROW_H / 2;
      const row: string[] = [diamond(t, PX + 3, cy, 6)];
      let nameMax = innerW - 15;
      if (config.showInstall) {
        const cmd = buildInstall(config.installTemplate, s.repo);
        const chip = installChip(t, cmd, 0, 0, innerW * 0.62, 10, 23);
        // Chip hugs the right; measure first, then place (installChip sizes to content).
        const chipX = W - PX - chip.w;
        row.push(installChip(t, cmd, chipX, cy - 11.5, innerW * 0.62, 10, 23).svg);
        nameMax = chipX - (PX + 15) - 9;
      }
      row.push(
        `<text x="${PX + 15}" y="${(cy + 12.5 * 0.34).toFixed(1)}" font-family="${t.mono}" font-size="12.5" font-weight="600" fill="${t.ink}">${escapeXml(truncateMono(shortName(s.repo), 12.5, nameMax))}</text>`,
      );
      parts.push(`<a href="https://github.com/${escapeXml(s.repo)}" target="_blank">${row.join("")}</a>`);
      y += ROW_H;
    }

    return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
  },
};
