import type { Template } from "../types";
import { escapeXml, truncateToWidth, truncateMono } from "../svg";
import { buildInstall } from "../skill";
import { cardShell, installChip, countPill, measureFs, shortName } from "../parts";

// Variant List: 410 compact — two pair side by side in a ~846px README column. Header = title + count pill;
// each skill stacks a bold short name over a full-width command chip (the chip gets the whole width so long
// commands stay readable at this size). No footer credit line — space is precious.
const W = 400;
const PX = 18;
const ROW_TOP = 9;
const NAME_H = 17;
const CHIP_GAP = 6;
const CHIP_H = 23;

export const list: Template = {
  key: "list",
  render(config, ctx) {
    const t = ctx.tokens;
    const title = config.title || "My Agent Skills";
    const innerW = W - PX * 2;
    const rowH = ROW_TOP + NAME_H + (config.showInstall ? CHIP_GAP + CHIP_H : 0) + 9;

    const headH = 16 + 22 + 8;
    const cardH = headH + config.skills.length * rowH + 14;

    const shell = cardShell(t, W, cardH, t.radiusSm);
    const parts: string[] = [shell.svg];

    // Header: title + count pill.
    const headCy = 16 + 11;
    const pill = countPill(t, String(config.skills.length), W - PX, headCy, 11);
    parts.push(pill.svg);
    parts.push(
      `<text x="${PX}" y="${(headCy + 16 * 0.34).toFixed(1)}" font-family="${t.font}" font-size="16" font-weight="700" fill="${t.ink}">${escapeXml(truncateToWidth(title, measureFs(t, 16), innerW - pill.w - 12))}</text>`,
    );

    // Rows (each wrapped in an <a>: clickable to its repo when the SVG is opened directly; static behind camo in a README)
    let y = headH;
    for (const s of config.skills) {
      parts.push(`<line x1="${PX - 4}" y1="${y.toFixed(1)}" x2="${W - PX + 4}" y2="${y.toFixed(1)}" stroke="${t.divider}" stroke-width="1"/>`);
      const row: string[] = [
        `<text x="${PX}" y="${(y + ROW_TOP + 13).toFixed(1)}" font-family="${t.mono}" font-size="13" font-weight="600" fill="${t.ink}">${escapeXml(truncateMono(shortName(s.repo), 13, innerW))}</text>`,
      ];
      if (config.showInstall) {
        row.push(installChip(t, buildInstall(config.installTemplate, s.repo), PX, y + ROW_TOP + NAME_H + CHIP_GAP, innerW, 10, CHIP_H).svg);
      }
      parts.push(`<a href="https://github.com/${escapeXml(s.repo)}" target="_blank">${row.join("")}</a>`);
      y += rowH;
    }

    return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
  },
};
