import type { Template } from "../types";
import { escapeXml, truncateToWidth, truncateMono, wrapText } from "../svg";
import { buildInstall } from "../skill";
import { cardShell, installChip, countPill, measureFs, shortName, descOf } from "../parts";

// Variant Grid: 640, two-column tiles. Header = title + count pill; tile = short name / description (2 lines) / command bar.
// Tiles share one height (reserved per the toggles) so the grid rhythm stays steady.
const W = 640;
const PX = 24;
const GAP = 10;

export const grid: Template = {
  key: "grid",
  render(config, ctx) {
    const t = ctx.tokens;
    const title = config.title || "My Agent Skills";
    const innerW = W - PX * 2;
    const tileW = (innerW - GAP) / 2;
    const tilePad = 13;
    const tileInner = tileW - tilePad * 2;

    // Tile content height: name row 19; description always reserves 2 lines (equal height); command bar 24.
    const descH = config.showDesc ? 5 + 2 * 14 : 0;
    const cmdH = config.showInstall ? 8 + 24 : 0;
    const tileH = 12 + 19 + descH + cmdH + 12;

    const n = Math.max(config.skills.length, 1);
    const rows = Math.ceil(n / 2);
    const headH = 22 + 18 + 12;
    const cardH = headH + rows * tileH + (rows - 1) * GAP + 22;

    const shell = cardShell(t, W, cardH, t.radius);
    const parts: string[] = [shell.svg];

    // Header
    parts.push(
      `<text x="${PX}" y="${22 + 17}" font-family="${t.font}" font-size="19" font-weight="700" fill="${t.ink}">${escapeXml(truncateToWidth(title, measureFs(t, 19), innerW - 90))}</text>`,
    );
    parts.push(countPill(t, String(config.skills.length), W - PX, 22 + 11, 11).svg);

    // Tiles (each wrapped in an <a>: clickable to its repo when the SVG is opened directly; static and harmless behind camo in a README)
    config.skills.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = PX + col * (tileW + GAP);
      const y = headH + row * (tileH + GAP);
      const tile: string[] = [];
      tile.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${tileW.toFixed(1)}" height="${tileH}" rx="${t.radiusSm}" fill="none" stroke="${t.divider}" stroke-width="1"/>`,
      );
      const nameCy = y + 12 + 9.5;
      tile.push(
        `<text x="${(x + tilePad).toFixed(1)}" y="${(nameCy + 13 * 0.34).toFixed(1)}" font-family="${t.mono}" font-size="13" font-weight="600" fill="${t.ink}">${escapeXml(truncateMono(shortName(s.repo), 13, tileInner))}</text>`,
      );
      if (config.showDesc) {
        const lines = wrapText(descOf(s), measureFs(t, 11), tileInner, 2);
        lines.forEach((ln, k) => {
          tile.push(
            `<text x="${(x + tilePad).toFixed(1)}" y="${(y + 12 + 19 + 5 + 11 + k * 14).toFixed(1)}" font-family="${t.font}" font-size="11" fill="${t.muted}">${escapeXml(ln)}</text>`,
          );
        });
      }
      if (config.showInstall) {
        tile.push(installChip(t, buildInstall(config.installTemplate, s.repo), x + tilePad, y + 12 + 19 + descH + 8, tileInner, 9.5, 24).svg);
      }
      parts.push(`<a href="https://github.com/${escapeXml(s.repo)}" target="_blank">${tile.join("")}</a>`);
    });

    return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
  },
};
