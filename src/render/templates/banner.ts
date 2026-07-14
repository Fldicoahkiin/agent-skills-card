import type { Template } from "../types";
import { escapeXml, measureText, measureMono, truncateToWidth, truncateMono } from "../svg";
import { cardShell, dominantOwner, measureFs, shortName } from "../parts";

// Variant Banner: 830 slim strip. Left = title + `N agent skills · @owner`; right = short-name pill flow,
// wrapping as needed, right-aligned per line. Lightweight page-top decoration.
const W = 830;
const PX = 24;
const PILL_H = 26;
const PILL_GAP = 7;

export const banner: Template = {
  key: "banner",
  render(config, ctx) {
    const t = ctx.tokens;
    const title = config.title || "My Agent Skills";
    const innerW = W - PX * 2;

    // Left block: title 16 / mono subline 10.
    const titleW = Math.ceil(measureText(title, measureFs(t, 16)));
    const subTxt = `${config.skills.length} agent skills · @${dominantOwner(config.skills)}`;
    const subW = Math.ceil(measureMono(subTxt, 10));
    const leftW = Math.min(Math.max(titleW, subW), innerW * 0.55);

    // Right pill flow: measure widths, greedy line packing.
    const pills = config.skills.map((s) => {
      const label = truncateMono(shortName(s.repo), 11.5, 220);
      const w = 14 + Math.ceil(measureMono(label, 11.5)) + 14;
      return { repo: s.repo, label, w };
    });
    const flowW = innerW - leftW - 24;
    const rows: { repo: string; label: string; w: number }[][] = [[]];
    let acc = 0;
    for (const p of pills) {
      const cur = rows[rows.length - 1];
      const need = p.w + (cur.length ? PILL_GAP : 0);
      if (cur.length && acc + need > flowW) {
        rows.push([p]);
        acc = p.w;
      } else {
        cur.push(p);
        acc += need;
      }
    }
    const flowH = rows.length * PILL_H + (rows.length - 1) * PILL_GAP;
    const leftH = 36;
    const cardH = 18 + Math.max(leftH, flowH) + 18;

    const shell = cardShell(t, W, cardH, t.radius);
    const parts: string[] = [shell.svg];

    // Left block (vertically centered, text only — the icon was cut by the author's call).
    const leftCy = cardH / 2;
    const tx = PX;
    parts.push(
      `<text x="${tx}" y="${(leftCy - 3).toFixed(1)}" font-family="${t.font}" font-size="16" font-weight="700" fill="${t.ink}">${escapeXml(truncateToWidth(title, measureFs(t, 16), innerW * 0.5))}</text>`,
    );
    // Spaces at tspan boundaries collapse under XML whitespace handling (rsvg even eats &#160;): xml:space="preserve" keeps them.
    parts.push(
      `<text x="${tx}" y="${(leftCy + 13).toFixed(1)}" font-family="${t.mono}" font-size="10" xml:space="preserve">` +
        `<tspan fill="${t.accent}" font-weight="600">${config.skills.length}</tspan>` +
        `<tspan fill="${t.muted}"> agent skills · @${escapeXml(dominantOwner(config.skills))}</tspan></text>`,
    );

    // Right pill flow: each line right-aligned.
    const flowTop = cardH / 2 - flowH / 2;
    rows.forEach((row, ri) => {
      const rowW = row.reduce((a, p) => a + p.w, 0) + (row.length - 1) * PILL_GAP;
      let x = W - PX - rowW;
      const y = flowTop + ri * (PILL_H + PILL_GAP);
      for (const p of row) {
        const cy = y + PILL_H / 2;
        parts.push(
          `<a href="https://github.com/${escapeXml(p.repo)}" target="_blank">` +
            `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${p.w}" height="${PILL_H}" rx="${PILL_H / 2}" fill="none" stroke="${t.divider}" stroke-width="1"/>` +
            `<text x="${(x + 14).toFixed(1)}" y="${(cy + 11.5 * 0.34).toFixed(1)}" font-family="${t.mono}" font-size="11.5" font-weight="500" fill="${t.ink}">${escapeXml(p.label)}</text>` +
            "</a>",
        );
        x += p.w + PILL_GAP;
      }
    });

    return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
  },
};
