import type { StyleTokens } from "./types";

// Card styles × light/dark. candy is the site's own neo-brutalist look (cream/ink/candy);
// the next eight palettes come verbatim from the design draft.
// Fonts: the draft uses Space Grotesk / JetBrains Mono / Source Serif 4, but READMEs load the SVG via camo
// where web fonts can't load, so these map to the closest system stacks (the site UI uses the real web fonts).
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,monospace";
const SERIF = "Georgia,'Times New Roman',serif";
const HELV = "'Helvetica Neue',Helvetica,Arial,sans-serif";

type StylePreset = { light: StyleTokens; dark: StyleTokens };

export const STYLES: Record<string, StylePreset> = {
  candy: {
    light: { surface: "#ffffff", ink: "#141111", muted: "#57534d", faint: "#6d675f", border: "#141111", divider: "#e8e0cc", accent: "#fe7da8", accentInk: "#141111", accentSoft: "#ffd440", font: HELV, mono: MONO, radius: 0, radiusSm: 0, bw: 2, hardShadow: "#141111" },
    dark: { surface: "#201d1a", ink: "#f2ede2", muted: "#b5afa2", faint: "#9a927e", border: "#f2ede2", divider: "#3a352c", accent: "#fe7da8", accentInk: "#141111", accentSoft: "#ffd440", font: HELV, mono: MONO, radius: 0, radiusSm: 0, bw: 2, hardShadow: "rgba(242,237,226,0.9)" },
  },
  claude: {
    light: { surface: "#fffdfb", ink: "#2b2622", muted: "#8b8178", faint: "#b3aaa0", border: "#ece6de", divider: "#efe9e1", accent: "#c15f38", accentInk: "#a84e2b", accentSoft: "#f7e9e2", font: SANS, mono: MONO, radius: 16, radiusSm: 12, bw: 1 },
    dark: { surface: "#211d19", ink: "#efe9e2", muted: "#9a9188", faint: "#6b6259", border: "#332e28", divider: "#2c2822", accent: "#e58a5e", accentInk: "#f0a67e", accentSoft: "#33261e", font: SANS, mono: MONO, radius: 16, radiusSm: 12, bw: 1 },
  },
  github: {
    light: { surface: "#ffffff", ink: "#1f2328", muted: "#656d76", faint: "#8c959f", border: "#d0d7de", divider: "#d8dee4", accent: "#0969da", accentInk: "#0969da", accentSoft: "#f6f8fa", font: SANS, mono: MONO, radius: 8, radiusSm: 8, bw: 1 },
    dark: { surface: "#0d1117", ink: "#e6edf3", muted: "#7d8590", faint: "#6e7681", border: "#30363d", divider: "#21262d", accent: "#58a6ff", accentInk: "#58a6ff", accentSoft: "#161b22", font: SANS, mono: MONO, radius: 8, radiusSm: 8, bw: 1 },
  },
  terminal: {
    light: { surface: "#fbf7ec", ink: "#3b3a34", muted: "#7a776b", faint: "#a6a394", border: "#e6e0cf", divider: "#efe9d8", accent: "#2f8f4e", accentInk: "#2f8f4e", accentSoft: "#f0ead6", barBg: "#efe9d8", prompt: "#2f8f4e", path: "#2a6fb0", arg: "#b0741f", font: MONO, mono: MONO, radius: 10, radiusSm: 10, bw: 1 },
    dark: { surface: "#0d0f11", ink: "#c9d1d9", muted: "#8b949e", faint: "#6a7076", border: "#23272e", divider: "#1b1f24", accent: "#3fb950", accentInk: "#6ee7a0", accentSoft: "#161b22", barBg: "#191d21", prompt: "#3fb950", path: "#58a6ff", arg: "#e5c07b", font: MONO, mono: MONO, radius: 10, radiusSm: 10, bw: 1 },
  },
  brutalist: {
    light: { surface: "#fffdf5", ink: "#16130c", muted: "#6b6659", faint: "#8a8574", border: "#16130c", divider: "#d9d2bd", accent: "#e8481c", accentInk: "#16130c", accentSoft: "#f4eedd", font: SANS, mono: MONO, radius: 6, radiusSm: 6, bw: 2, hardShadow: "#16130c" },
    dark: { surface: "#16130c", ink: "#fdf7e3", muted: "#b8b09a", faint: "#8a8574", border: "#fdf7e3", divider: "#3a352a", accent: "#ffd43b", accentInk: "#ffd43b", accentSoft: "#2a2519", font: SANS, mono: MONO, radius: 6, radiusSm: 6, bw: 2, hardShadow: "rgba(253,247,227,0.9)" },
  },
  blueprint: {
    light: { surface: "#f6f8ff", ink: "#17346b", muted: "#5570a8", faint: "#8aa0c8", border: "#b9c9ec", divider: "#d7e0f4", accent: "#2b58e8", accentInk: "#2b58e8", accentSoft: "#e9edfc", grid: "rgba(43,88,232,0.05)", font: MONO, mono: MONO, radius: 4, radiusSm: 4, bw: 1 },
    dark: { surface: "#0d1b33", ink: "#dbe6ff", muted: "#93a7d1", faint: "#5f739e", border: "#28407a", divider: "#1d3059", accent: "#7aa2f7", accentInk: "#9db9f9", accentSoft: "#152747", grid: "rgba(122,162,247,0.07)", font: MONO, mono: MONO, radius: 4, radiusSm: 4, bw: 1 },
  },
  neon: {
    light: { surface: "#ffffff", ink: "#2a1440", muted: "#8a6fa8", faint: "#b9a3d0", border: "#f0d8ea", divider: "#f7e8f3", accent: "#e01fad", accentInk: "#c21895", accentSoft: "#fbe6f5", font: SANS, mono: MONO, radius: 14, radiusSm: 12, bw: 1 },
    dark: { surface: "#140a20", ink: "#f3e8ff", muted: "#b39ac9", faint: "#7d659a", border: "#3a2354", divider: "#2a1840", accent: "#ff4ecd", accentInk: "#ff7ddb", accentSoft: "#2a1440", font: SANS, mono: MONO, radius: 14, radiusSm: 12, bw: 1 },
  },
  editorial: {
    light: { surface: "#fbf6ec", ink: "#211d15", muted: "#7d7565", faint: "#a89f8d", border: "#e3d9c6", divider: "#e9e0cd", accent: "#7d1f2e", accentInk: "#7d1f2e", accentSoft: "#f3e8dd", font: SERIF, mono: MONO, radius: 2, radiusSm: 2, bw: 1 },
    dark: { surface: "#201c16", ink: "#efe6d4", muted: "#a99d87", faint: "#776d5b", border: "#3c352a", divider: "#302a20", accent: "#c65f5f", accentInk: "#d98282", accentSoft: "#322a20", font: SERIF, mono: MONO, radius: 2, radiusSm: 2, bw: 1 },
  },
  minimal: {
    light: { surface: "#ffffff", ink: "#111111", muted: "#666666", faint: "#999999", border: "#111111", divider: "#e5e5e5", accent: "#111111", accentInk: "#111111", accentSoft: "#f2f2f2", font: HELV, mono: MONO, radius: 0, radiusSm: 0, bw: 1 },
    dark: { surface: "#0a0a0a", ink: "#fafafa", muted: "#a3a3a3", faint: "#666666", border: "#fafafa", divider: "#262626", accent: "#fafafa", accentInk: "#fafafa", accentSoft: "#1a1a1a", font: HELV, mono: MONO, radius: 0, radiusSm: 0, bw: 1 },
  },
  // The four below come from well-known editor themes, colors per each official palette.
  gruvbox: {
    light: { surface: "#fbf1c7", ink: "#3c3836", muted: "#7c6f64", faint: "#a89984", border: "#d5c4a1", divider: "#ebdbb2", accent: "#d65d0e", accentInk: "#af3a03", accentSoft: "#f2e5bc", font: SANS, mono: MONO, radius: 8, radiusSm: 8, bw: 1 },
    dark: { surface: "#282828", ink: "#ebdbb2", muted: "#a89984", faint: "#7c6f64", border: "#504945", divider: "#3c3836", accent: "#fe8019", accentInk: "#fe8019", accentSoft: "#3c3836", font: SANS, mono: MONO, radius: 8, radiusSm: 8, bw: 1 },
  },
  nord: {
    light: { surface: "#eceff4", ink: "#2e3440", muted: "#4c566a", faint: "#7b88a1", border: "#d8dee9", divider: "#e5e9f0", accent: "#5e81ac", accentInk: "#5e81ac", accentSoft: "#e5e9f0", font: SANS, mono: MONO, radius: 10, radiusSm: 8, bw: 1 },
    dark: { surface: "#2e3440", ink: "#eceff4", muted: "#d8dee9", faint: "#616e88", border: "#434c5e", divider: "#3b4252", accent: "#88c0d0", accentInk: "#88c0d0", accentSoft: "#3b4252", font: SANS, mono: MONO, radius: 10, radiusSm: 8, bw: 1 },
  },
  dracula: {
    light: { surface: "#f8f8f2", ink: "#282a36", muted: "#6272a4", faint: "#a0a8c7", border: "#d5d8e8", divider: "#e5e7f0", accent: "#7c4dbe", accentInk: "#644ac9", accentSoft: "#efeafa", font: SANS, mono: MONO, radius: 12, radiusSm: 10, bw: 1 },
    dark: { surface: "#282a36", ink: "#f8f8f2", muted: "#9aa5ce", faint: "#6272a4", border: "#44475a", divider: "#343746", accent: "#bd93f9", accentInk: "#d6acff", accentSoft: "#343746", font: SANS, mono: MONO, radius: 12, radiusSm: 10, bw: 1 },
  },
  vercel: {
    light: { surface: "#ffffff", ink: "#000000", muted: "#666666", faint: "#999999", border: "#eaeaea", divider: "#eaeaea", accent: "#000000", accentInk: "#ffffff", accentSoft: "#000000", font: SANS, mono: MONO, radius: 8, radiusSm: 6, bw: 1 },
    dark: { surface: "#000000", ink: "#ffffff", muted: "#888888", faint: "#666666", border: "#333333", divider: "#222222", accent: "#ffffff", accentInk: "#000000", accentSoft: "#ffffff", font: SANS, mono: MONO, radius: 8, radiusSm: 6, bw: 1 },
  },
  codex: {
    light: { surface: "#ffffff", ink: "#0d0d0d", muted: "#6e6e80", faint: "#a0a0ab", border: "#ececf1", divider: "#ececf1", accent: "#10a37f", accentInk: "#0c8a6a", accentSoft: "#e6f6f1", font: SANS, mono: MONO, radius: 12, radiusSm: 10, bw: 1 },
    dark: { surface: "#202123", ink: "#ececf1", muted: "#a5a5b3", faint: "#71717f", border: "#3e3f4b", divider: "#33343d", accent: "#19c37d", accentInk: "#34d092", accentSoft: "#122b23", font: SANS, mono: MONO, radius: 12, radiusSm: 10, bw: 1 },
  },
  catppuccin: {
    light: { surface: "#eff1f5", ink: "#4c4f69", muted: "#6c6f85", faint: "#9ca0b0", border: "#ccd0da", divider: "#dce0e8", accent: "#8839ef", accentInk: "#8839ef", accentSoft: "#e6e9ef", font: SANS, mono: MONO, radius: 14, radiusSm: 12, bw: 1 },
    dark: { surface: "#1e1e2e", ink: "#cdd6f4", muted: "#a6adc8", faint: "#6c7086", border: "#45475a", divider: "#313244", accent: "#cba6f7", accentInk: "#cba6f7", accentSoft: "#313244", font: SANS, mono: MONO, radius: 14, radiusSm: 12, bw: 1 },
  },
};

// Metadata for the site's style picker (name / subtitle / three swatches), matching the draft.
export const STYLE_META = [
  { key: "candy", name: "Candy", sub: "candy cutout", sw: ["#fe7da8", "#ffd440", "#141111"] },
  { key: "claude", name: "Claude", sub: "warm editorial", sw: ["#c15f38", "#fffdfb", "#2b2622"] },
  { key: "github", name: "GitHub", sub: "native familiar", sw: ["#0d1117", "#58a6ff", "#d0d7de"] },
  { key: "terminal", name: "Terminal", sub: "mono shell", sw: ["#0d0f11", "#3fb950", "#e5c07b"] },
  { key: "brutalist", name: "Brutalist", sub: "bold hard-edge", sw: ["#e8481c", "#16130c", "#fffdf5"] },
  { key: "blueprint", name: "Blueprint", sub: "technical grid", sw: ["#2b58e8", "#f6f8ff", "#0d1b33"] },
  { key: "neon", name: "Neon", sub: "synth glow", sw: ["#ff4ecd", "#140a20", "#f3e8ff"] },
  { key: "editorial", name: "Editorial", sub: "serif print", sw: ["#7d1f2e", "#fbf6ec", "#211d15"] },
  { key: "minimal", name: "Minimal", sub: "swiss mono", sw: ["#111111", "#ffffff", "#e5e5e5"] },
  { key: "gruvbox", name: "Gruvbox", sub: "retro warm", sw: ["#fe8019", "#282828", "#fbf1c7"] },
  { key: "nord", name: "Nord", sub: "arctic calm", sw: ["#88c0d0", "#2e3440", "#eceff4"] },
  { key: "dracula", name: "Dracula", sub: "midnight purple", sw: ["#bd93f9", "#282a36", "#f8f8f2"] },
  { key: "catppuccin", name: "Catppuccin", sub: "pastel cream", sw: ["#cba6f7", "#1e1e2e", "#eff1f5"] },
  { key: "vercel", name: "Vercel", sub: "geist mono-chrome", sw: ["#000000", "#ffffff", "#0070f3"] },
  { key: "codex", name: "Codex", sub: "openai teal", sw: ["#10a37f", "#202123", "#ececf1"] },
] as const;

export function resolveStyle(style: string, theme: "light" | "dark"): StyleTokens {
  const preset = STYLES[style] ?? STYLES.claude;
  return preset[theme] ?? preset.light;
}
