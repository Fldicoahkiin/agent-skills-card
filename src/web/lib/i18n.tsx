import { createContext, useContext, useState, type ReactNode } from "react";

// Lightweight i18n: zh/en dictionaries + t(key, vars). Defaults to the browser language, toggleable in the header.
const dict = {
  zh: {
    badge: "for GitHub README",
    repos: "技能仓库",
    reposHint: "一个仓库 = 一个 skill,每条各带安装命令;输入用户名可列出其全部仓库",
    addBtn: "添加",
    cardTitle: "卡片标题",
    style: "风格",
    cardTheme: "卡片主题",
    form: "形态",
    content: "内容",
    tgDesc: "仓库描述",
    tgInstall: "npx 安装命令",
    light: "亮色",
    dark: "暗色",
    embed: "复制嵌入",
    copy: "复制",
    copied: "已复制 ✓",
    copyCmd: "复制命令",
    openRepo: "打开仓库",
    toastCopied: "已复制 · {label}",
    installCmd: "安装命令",
    installHint: "{repo} 为仓库占位符,可换成 install.sh 等其他安装方式",
    dragSort: "拖拽排序",
    editDesc: "点击编辑自定义描述",
    editDescPlaceholder: "自定义描述(留空用 GitHub 简介)",
    editDescHint: "{repo} 的自定义描述,回车保存,清空则回落 GitHub 简介",
    commands: "安装命令",
    commandsHint: "README 里的卡片是静态图,访客点卡回到本页复制这些命令。",
    langTitle: "Switch to English",
    themeTitle: "明暗切换",
    form_full: "Full",
    form_full_sub: "830 · 全宽详情",
    form_list: "List",
    form_list_sub: "495 · 半宽速览",
    form_grid: "Grid",
    form_grid_sub: "640 · 双列磁贴",
    form_banner: "Banner",
    form_banner_sub: "830 · 矮条标签",
    hint_full: "README 全宽,描述+命令最全",
    hint_list: "半宽,单行密排",
    hint_grid: "磁贴卡,均衡展示",
    hint_banner: "页首横幅,轻量装饰",
    tab_markdown: "贴进 README.md。外层链接指向带相同参数的本站页面,访客点卡片即可到站上复制各条 npx 命令。",
    tab_html: "README 也支持 HTML 嵌入,可控制宽度。",
    tab_url: "SVG 直链,可用于任何支持图片的地方。",
    previewEmpty: "添加 skill 仓库后,实时预览出现在这里",
    inputPlaceholder: "owner/skill-repo 或 用户名",
    errFormat: "格式应为 owner/repo、GitHub 链接 或 用户名",
    errExists: "已经添加过了",
    errRepoNotFound: "找不到这个仓库",
    errUserNotFound: "找不到这个用户",
    errRequest: "请求失败,稍后再试",
    reposN: "{n} 个仓库",
    skillsN: "{n} 个 skill",
    allSkills: "全部 skill",
    collapse: "收起",
    noPublicRepos: "该用户没有公开的非 fork 仓库。",
    remove: "移除",
  },
  en: {
    badge: "for GitHub README",
    repos: "Skill repositories",
    reposHint: "One repo = one skill, each with its own install command; type a username to list all their repos",
    addBtn: "Add",
    cardTitle: "Card title",
    style: "Style",
    cardTheme: "Card theme",
    form: "Form",
    content: "Content",
    tgDesc: "Repo description",
    tgInstall: "npx install command",
    light: "Light",
    dark: "Dark",
    embed: "Copy & embed",
    copy: "Copy",
    copied: "Copied ✓",
    copyCmd: "Copy command",
    openRepo: "Open repo",
    toastCopied: "Copied · {label}",
    installCmd: "Install command",
    installHint: "{repo} is the placeholder; swap in install.sh or any other installer",
    dragSort: "Drag to reorder",
    editDesc: "Click to edit custom description",
    editDescPlaceholder: "Custom description (empty = GitHub description)",
    editDescHint: "Custom description for {repo}; Enter to save, clear to fall back to GitHub",
    commands: "Install commands",
    commandsHint: "The README card is a static image — visitors click it back to this page to copy these commands.",
    langTitle: "切换到中文",
    themeTitle: "Toggle theme",
    form_full: "Full",
    form_full_sub: "830 · full detail",
    form_list: "List",
    form_list_sub: "495 · half width",
    form_grid: "Grid",
    form_grid_sub: "640 · two-col tiles",
    form_banner: "Banner",
    form_banner_sub: "830 · slim strip",
    hint_full: "Full README width, max detail",
    hint_list: "Half width, dense rows",
    hint_grid: "Tile cards, balanced",
    hint_banner: "Slim header strip",
    tab_markdown: "Paste into README.md. The image links to this site with the same params so visitors can copy each npx command.",
    tab_html: "READMEs accept HTML embeds too — lets you control width.",
    tab_url: "Direct SVG link for anywhere images work.",
    previewEmpty: "Add skill repos and the live preview shows here",
    inputPlaceholder: "owner/skill-repo or a username",
    errFormat: "Use owner/repo, a GitHub URL, or a username",
    errExists: "Already added",
    errRepoNotFound: "Repo not found",
    errUserNotFound: "User not found",
    errRequest: "Request failed, try again",
    reposN: "{n} repos",
    skillsN: "{n} skills",
    allSkills: "All skills",
    collapse: "Collapse",
    noPublicRepos: "This user has no public non-fork repos.",
    remove: "Remove",
  },
} as const;

export type Lang = keyof typeof dict;
export type TKey = keyof (typeof dict)["zh"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey, vars?: Record<string, string | number>) => string };
const I18nCtx = createContext<Ctx | null>(null);

function detect(): Lang {
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
}

// Pure table lookup + {var} interpolation; missing keys fall back to zh. Extracted for unit tests.
export function translate(lang: Lang, k: TKey, vars?: Record<string, string | number>): string {
  let s: string = dict[lang][k] ?? dict.zh[k];
  if (vars) for (const [vk, vv] of Object.entries(vars)) s = s.replace(`{${vk}}`, String(vv));
  return s;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detect);
  const t = (k: TKey, vars?: Record<string, string | number>) => translate(lang, k, vars);
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
