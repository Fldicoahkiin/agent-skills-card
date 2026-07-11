// SVG string assembly and text-measurement helpers. Every untrusted string entering the SVG must pass escapeXml.

  "M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Zm5-3C5 2.784 5.784 2 6.75 2h7.5C15.216 2 16 2.784 16 3.75v7.5A1.75 1.75 0 0 1 14.25 13h-7.5A1.75 1.75 0 0 1 5 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Full-width check per code point (CJK, kana, hangul, full-width punctuation, emoji, …).
function isWide(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    cp >= 0x1f000
  );
}

// Estimate text width in px: ~1em per full-width char, ~0.5em per half-width. Always by code point, never raw char count.
export function measureText(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) units += isWide(ch.codePointAt(0)!) ? 1 : 0.5;
  return units * fontSize;
}

// Monospace width at ~0.6em/char (measureText models proportional fonts and under-counts mono).
export function measureMono(text: string, fontSize: number): number {
  let units = 0;
  for (const ch of text) units += isWide(ch.codePointAt(0)!) ? 1 : 0.6;
  return units * fontSize;
}

// Truncation for mono-rendered text at ~0.6em/char (truncateToWidth models proportional fonts and under-counts ~20%).
export function truncateMono(text: string, fontSize: number, maxWidth: number): string {
  return truncateToWidth(text, fontSize * 1.2, maxWidth);
}

// Truncate to a width (ellipsis on overflow), by code point so surrogate pairs / CJK never get split.
export function truncateToWidth(text: string, fontSize: number, maxWidth: number): string {
  if (measureText(text, fontSize) <= maxWidth) return text;
  const ellW = measureText("…", fontSize);
  let acc = 0;
  let out = "";
  for (const ch of text) {
    const w = measureText(ch, fontSize);
    if (acc + w + ellW > maxWidth) break;
    out += ch;
    acc += w;
  }
  return out + "…";
}

// The mono command prefers to render whole (the command is the product's selling point): baseFs when it fits;
// otherwise shrink just enough (down to minFs); only then truncate. Returns the final font size and text.
export function fitMono(text: string, maxWidth: number, baseFs: number, minFs = 9): { fontSize: number; text: string } {
  if (measureMono(text, baseFs) <= maxWidth) return { fontSize: baseFs, text };
  const fs = (maxWidth / measureMono(text, baseFs)) * baseFs;
  if (fs >= minFs) return { fontSize: fs, text };
  const maxChars = Math.max(4, Math.floor(maxWidth / (minFs * 0.6)));
  return { fontSize: minFs, text: `${text.slice(0, maxChars - 1)}…` };
}

// Greedy width-based wrapping; oversized words hard-break by code point (CJK wraps without spaces). Last line gets an ellipsis on overflow.
export function wrapText(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let line = "";
  const pushWord = (word: string) => {
    if (lines.length >= maxLines) return;
    const cand = line ? `${line} ${word}` : word;
    if (measureText(cand, fontSize) <= maxWidth) {
      line = cand;
      return;
    }
    if (line) {
      lines.push(line);
      line = "";
      if (lines.length >= maxLines) return;
    }
    if (measureText(word, fontSize) <= maxWidth) {
      line = word;
      return;
    }
    let chunk = "";
    for (const ch of word) {
      if (chunk && measureText(chunk + ch, fontSize) > maxWidth) {
        lines.push(chunk);
        chunk = ch;
        if (lines.length >= maxLines) return;
      } else {
        chunk += ch;
      }
    }
    line = chunk;
  };

  for (const word of text.split(/\s+/).filter(Boolean)) {
    pushWord(word);
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length > maxLines) lines.length = maxLines;

  const dense = (s: string) => Array.from(s.replace(/\s+/g, "")).length;
  if (lines.length && dense(lines.join("")) < dense(text)) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = truncateToWidth(`${last}…`, fontSize, maxWidth);
  }
  return lines;
}
