// Full description of a showcase config. The site builds it and serializes it into the URL; the server parses it back, enriches with GitHub metadata, and renders.
// All rendering is a pure ShowcaseConfig -> SVG string function (isomorphic: site preview and /api/svg share it).

// All tokens of one style in one theme (maps to the draft's palettes.<style>.<light|dark>).
// Cards travel through camo in READMEs and can't load web fonts: font/mono/serif are system stacks approximating the draft's type.
export type StyleTokens = {
  surface: string; // card face color (blueprint's grid texture is overlaid as a <pattern> in the template)
  ink: string;
  muted: string;
  faint: string;
  border: string;
  divider: string;
  accent: string;
  accentInk: string;
  accentSoft: string;
  font: string; // body font stack
  mono: string;
  radius: number;
  radiusSm: number;
  bw: number; // border width (2 for brutalist)
  // terminal style only (undefined elsewhere)
  barBg?: string;
  prompt?: string;
  path?: string;
  arg?: string;
  // blueprint only: grid line color (when set, the card face gets the blueprint grid)
  grid?: string;
  // brutalist only: bottom-right hard shadow color (when set, the image expands 6px for the solid shadow)
  hardShadow?: string;
};

// One showcased skill repo. repo is the stable id; name/description/stars come from the GitHub API and can be overridden.
// stars never render on the card (the draft's big number is the skills count), but /api/repo and the discover panel use it.
export type SkillEntry = {
  repo: string; // "owner/repo"
  name: string; // display name (defaults to the repo name)
  description: string; // defaults to the repo description
  descOverride?: string; // user-supplied description (no repo blurb / different wording); wins over description when rendering
  stars: number | null; // live; null = not fetched
};

export type ShowcaseConfig = {
  skills: SkillEntry[];
  title: string | null; // null → renderer falls back to "My Agent Skills"
  style: string; // style key (claude/github/terminal/…)
  theme: "light" | "dark"; // card light/dark
  variant: string; // variant key: full / list / grid / banner
  installTemplate: string; // install command template, {repo} placeholder (default npx skills add; swappable for install.sh-style repos)
  showDesc: boolean;
  showInstall: boolean;
};

// Response shape of /api/repo, shared by server and web (one RepoMeta, no drift between the two).
export type RepoResponse = {
  repo: string;
  name: string;
  description: string;
  stars: number;
};

// One /api/discover item: a public repo of a user. isSkill is flagged from skill-related topics / names.
export type DiscoverRepo = {
  repo: string;
  name: string;
  description: string;
  stars: number;
  isSkill: boolean;
};

export type RenderContext = { tokens: StyleTokens };

export type RenderResult = {
  width: number;
  height: number;
  body: string; // inner content of the <svg>
  defs?: string;
};

export type Template = {
  key: string;
  render: (config: ShowcaseConfig, ctx: RenderContext) => RenderResult;
};
