import type { Template, StyleTokens, ShowcaseConfig } from "../types";
import { escapeXml, measureMono, truncateToWidth, truncateMono, wrapText, fitMono } from "../svg";
import { buildInstall } from "../skill";
import { cardShell, diamond, dominantOwner, installChip, measureFs, shortName, descOf } from "../parts";

// Variant Full: 830, README full width, highest density. Header eyebrow + title / big skills-count number on the right,
// row = diamond + short name + right-aligned description (≤2 lines) + command chip, legend at the bottom.
// With the terminal style the whole card renders as a terminal window instead (➜ ~ npx skills add …).
const W = 830;
const PX = 28;

export const full: Template = {
  key: "full",
  render(config, ctx) {
    const t = ctx.tokens;
    if (t.prompt) return renderTerminal(config, t);

    const title = config.title || "My Agent Skills";
    const totalStr = String(config.skills.length).padStart(2, "0");
    const innerW = W - PX * 2;

    // Header block height: eyebrow 10 + gap 8 + title 24.
    const headerH = 10 + 8 + 26;
    // Row layout precomputed (row height floats with the description line count).
    const rows = config.skills.map((s) => {
      const label = shortName(s.repo);
      const nameW = Math.ceil(measureMono(label, 13.5));
      const descW = innerW - 12 - 7 - nameW - 12 - 8;
      const descLines = config.showDesc ? wrapText(descOf(s), measureFs(t, 11.5), Math.max(80, descW), 2) : [];
      const blockH = Math.max(19, descLines.length * 16);
      const rowH = 11 + blockH + (config.showInstall ? 6 + 27 : 0) + 11;
      return { s, label, nameW, descLines, blockH, rowH };
    });
    const rowsH = rows.reduce((a, r) => a + r.rowH, 0);
    const footerH = 14 + 13 + 12;
    const cardH = 26 + headerH + 16 + rowsH + footerH + 22;

    const shell = cardShell(t, W, cardH, t.radius);
    const parts: string[] = [shell.svg];

    // Header
    let y = 26;
    parts.push(
      `<text x="${PX}" y="${y + 9}" font-family="${t.mono}" font-size="10" font-weight="600" letter-spacing="1.8" fill="${t.faint}">AGENT SKILLS</text>`,
    );
    parts.push(
      `<text x="${PX}" y="${y + 10 + 8 + 20}" font-family="${t.font}" font-size="24" font-weight="700" letter-spacing="-0.24" fill="${t.ink}">${escapeXml(truncateToWidth(title, measureFs(t, 24), innerW - 120))}</text>`,
    );
    parts.push(
      `<text x="${W - PX}" y="${y + 26}" font-family="${t.font}" font-size="32" font-weight="700" fill="${t.accent}" text-anchor="end">${escapeXml(totalStr)}</text>`,
    );
    parts.push(
      `<text x="${W - PX}" y="${y + 26 + 14}" font-family="${t.mono}" font-size="9" letter-spacing="1.8" fill="${t.faint}" text-anchor="end">SKILLS</text>`,
    );
    y += headerH + 16;

    // Rows (each wrapped in an <a>: clickable to its repo when the SVG is opened directly; static and harmless behind camo in a README)
    for (const r of rows) {
      parts.push(`<line x1="${PX - 8}" y1="${y.toFixed(1)}" x2="${W - PX + 8}" y2="${y.toFixed(1)}" stroke="${t.divider}" stroke-width="${t.bw}"/>`);
      const nameCy = y + 11 + 9.5;
      const row: string[] = [];
      row.push(diamond(t, PX + 3.5, nameCy, 7));
      row.push(
        `<text x="${PX + 19}" y="${(nameCy + 13.5 * 0.34).toFixed(1)}" font-family="${t.mono}" font-size="13.5" font-weight="600" fill="${t.ink}">${escapeXml(r.label)}</text>`,
      );
      // Description: right-aligned, starting on the name's line, at most two lines.
      r.descLines.forEach((ln, k) => {
        row.push(
          `<text x="${W - PX}" y="${(y + 11 + 12 + k * 16).toFixed(1)}" font-family="${t.font}" font-size="11.5" fill="${t.muted}" text-anchor="end">${escapeXml(ln)}</text>`,
        );
      });
      if (config.showInstall) {
        row.push(installChip(t, buildInstall(config.installTemplate, r.s.repo), PX + 19, y + 11 + r.blockH + 6, innerW - 19, 11, 27).svg);
      }
      parts.push(`<a href="https://github.com/${escapeXml(r.s.repo)}" target="_blank">${row.join("")}</a>`);
      y += r.rowH;
    }

    // Footer: credit the card owner (@owner), no site watermark — the card is the user's own showcase.
    y += 14;
    parts.push(`<line x1="${PX}" y1="${y.toFixed(1)}" x2="${W - PX}" y2="${y.toFixed(1)}" stroke="${t.divider}" stroke-width="${t.bw}"/>`);
    const fy = y + 13 + 8;
    parts.push(`<text x="${PX}" y="${fy.toFixed(1)}" font-family="${t.mono}" font-size="10" fill="${t.faint}">@${escapeXml(dominantOwner(config.skills))}</text>`);

    return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
  },
};

// Terminal-style Full: mock terminal window. Traffic lights + centered title, row = `➜ ~ npx skills add repo` (prompt/path/arg colored)
// + `# description`, closing `→ N skills ready` line with a cursor block.
function renderTerminal(config: ShowcaseConfig, t: StyleTokens) {
  const title = config.title || "My Agent Skills";
  const BAR = 34;
  const PAD = 20;
  const LH = 22.5;
  const fs = 12.5;

  const blocks = config.skills.map((s) => ({
    s,
    lines: 1 + (config.showDesc ? 1 : 0),
  }));
  const bodyLines = blocks.reduce((a, b) => a + b.lines, 0);
  const bodyH = 18 + bodyLines * LH + blocks.length * 5 + 2 * LH + 14;
  const cardH = BAR + bodyH;

  const shell = cardShell(t, W, cardH, t.radius);
  const parts: string[] = [shell.svg];

  // Title bar (clipped to the card's rounded corners).
  parts.push(
    `<clipPath id="term-bar"><rect width="${W}" height="${cardH}" rx="${t.radius}"/></clipPath>` +
      `<g clip-path="url(#term-bar)"><rect width="${W}" height="${BAR}" fill="${t.barBg}"/></g>`,
  );
  for (const [i, c] of ["#ff5f57", "#febc2e", "#28c840"].entries()) {
    parts.push(`<circle cx="${20 + i * 20}" cy="${BAR / 2}" r="6" fill="${c}"/>`);
  }
  parts.push(
    `<text x="${W / 2}" y="${BAR / 2 + 4}" font-family="${t.mono}" font-size="11" fill="${t.faint}" text-anchor="middle">${escapeXml(truncateMono(`${title} — zsh`, 11, W - 160))}</text>`,
  );

  let y = BAR + 18 + 14;
  for (const b of blocks) {
    const cmdPrefixW = measureMono("➜ ~ ", fs);
    const cmd = buildInstall(config.installTemplate, b.s.repo);
    const fit = fitMono(cmd, W - PAD * 2 - cmdPrefixW - 8, fs);
    // The last segment (usually the owner/repo argument) gets the arg color; custom templates also split at the last space, close enough.
    const cut = fit.text.lastIndexOf(" ") + 1;
    const head = fit.text.slice(0, cut);
    const tail = fit.text.slice(cut);
    // Spaces at tspan boundaries collapse under XML whitespace handling (rsvg even eats &#160;): xml:space="preserve" is the fix both browsers and rsvg honor.
    parts.push(
      `<a href="https://github.com/${escapeXml(b.s.repo)}" target="_blank">` +
        `<text x="${PAD}" y="${y.toFixed(1)}" font-family="${t.mono}" font-size="${fit.fontSize.toFixed(1)}" xml:space="preserve">` +
        `<tspan fill="${t.prompt}">➜</tspan><tspan fill="${t.path}"> ~ </tspan>` +
        `<tspan fill="${t.ink}">${escapeXml(head)}</tspan><tspan fill="${t.arg}">${escapeXml(tail)}</tspan></text>` +
        "</a>",
    );
    y += LH;
    if (config.showDesc) {
      parts.push(
        `<text x="${PAD}" y="${y.toFixed(1)}" font-family="${t.mono}" font-size="${fs}" fill="${t.faint}">${escapeXml(truncateMono(`# ${descOf(b.s)}`, fs, W - PAD * 2))}</text>`,
      );
      y += LH;
    }
    y += 5;
  }
  parts.push(
    `<text x="${PAD}" y="${y.toFixed(1)}" font-family="${t.mono}" font-size="${fs}" xml:space="preserve"><tspan fill="${t.prompt}">→</tspan><tspan fill="${t.ink}"> ${config.skills.length} skills ready</tspan></text>`,
  );
  y += LH;
  parts.push(
    `<text x="${PAD}" y="${y.toFixed(1)}" font-family="${t.mono}" font-size="${fs}" xml:space="preserve"><tspan fill="${t.prompt}">➜</tspan><tspan fill="${t.path}"> ~ </tspan></text>`,
  );
  parts.push(`<rect x="${PAD + measureMono("➜ ~ ", fs)}" y="${(y - 12).toFixed(1)}" width="8" height="15" fill="${t.ink}"/>`);

  return { width: shell.totalW, height: shell.totalH, body: parts.join(""), defs: shell.defs };
}
