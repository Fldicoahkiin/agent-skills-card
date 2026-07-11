import { useEffect, useRef, useState } from "react";
import { MoonIcon as Moon, SunIcon as Sun } from "@phosphor-icons/react";
import { parseConfig, serializeConfig, buildExportSnippets, type ShowcaseConfig } from "../render";
import { fetchRepoMeta } from "./lib/api";
import { copyText } from "./lib/clipboard";
import { useI18n } from "./lib/i18n";
import { cn } from "./lib/utils";
import { buttonVariants } from "./ui/button";
import { SkillInput } from "./components/SkillInput";
import { Controls } from "./components/Controls";
import { Preview } from "./components/Preview";
import { CommandList } from "./components/CommandList";
import { ExportTabs } from "./components/ExportTabs";

const REPO = "https://github.com/Fldicoahkiin/agent-skills-card";

function initConfig(): ShowcaseConfig {
  return parseConfig(new URLSearchParams(location.search));
}

type SiteTheme = "light" | "dark";
function initSiteTheme(): SiteTheme {
  const saved = localStorage.getItem("site-theme");
  if (saved === "light" || saved === "dark") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function App() {
  const { t, lang, setLang } = useI18n();
  const [config, setConfig] = useState<ShowcaseConfig>(initConfig);
  const update = (patch: Partial<ShowcaseConfig>) => setConfig((c) => ({ ...c, ...patch }));

  // Site light/dark: html[data-theme] drives the tokens, remembered in localStorage, initially follows the system.
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(initSiteTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = siteTheme;
    localStorage.setItem("site-theme", siteTheme);
  }, [siteTheme]);

  // URL is the state: config written back to the address bar.
  const query = serializeConfig(config);
  useEffect(() => {
    history.replaceState(null, "", query ? `?${query}` : location.pathname);
  }, [query]);

  // Opened from a URL, skills carry only repo ids: hydrate descriptions and metadata so the page matches the final image.
  // Merge by repo and only fill entries whose stars are still null; never overwrite manually added/removed ones.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const missing = config.skills.filter((s) => s.stars == null).map((s) => s.repo);
    if (!missing.length) return;
    Promise.all(missing.map(fetchRepoMeta)).then((results) => {
      const byRepo = new Map(results.filter((r) => r.ok).map((r) => [r.meta.repo.toLowerCase(), r.meta]));
      setConfig((c) => ({
        ...c,
        skills: c.skills.map((s) => {
          if (s.stars != null) return s;
          const m = byRepo.get(s.repo.toLowerCase());
          return m ? { ...s, name: s.name || m.name, description: s.description || m.description, stars: m.stars } : s;
        }),
      }));
    });
  }, [config.skills]);

  // Toast: shared by copy feedback and errors (errors go through the toast, not scattered inline). No toast on copy failure (no fake feedback).
  const [toast, setToast] = useState<{ msg: string; on: boolean }>({ msg: "", on: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const notify = (msg: string) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, on: true });
    toastTimer.current = setTimeout(() => setToast((v) => ({ ...v, on: false })), 1800);
  };
  const copyCmd = async (text: string, label: string) => {
    if (!(await copyText(text))) return;
    notify(t("toastCopied", { label }));
  };

  const origin = import.meta.env.VITE_PUBLIC_ORIGIN || location.origin;
  const snippets = buildExportSnippets(config, origin);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b-2 bg-panel px-8 py-3.5 transition-colors">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-[-0.01em] whitespace-nowrap">Agent Skills Card</span>
              <span className="hidden rounded-none border-2 border-ink bg-yellow px-2 py-0.5 font-mono text-[10.5px] font-bold whitespace-nowrap text-[#141111] sm:inline-block">{t("badge")}</span>
            </div>
            <div className="mt-0.5 hidden font-mono text-[10.5px] text-faint sm:block">agent-skills-card.flacier.com</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title={t("langTitle")}
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 px-[11px] font-mono text-[11.5px] font-semibold")}
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button
            type="button"
            title={t("themeTitle")}
            onClick={() => setSiteTheme(siteTheme === "light" ? "dark" : "light")}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            {siteTheme === "light" ? <Sun className="size-[15px]" /> : <Moon className="size-[15px]" />}
          </button>
          <a href={REPO} target="_blank" rel="noreferrer" title="GitHub" className={cn(buttonVariants({ variant: "outline", size: "icon" }))}>
            {/* Official GitHub mark (octicons mark-github), not an icon-library variant */}
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-start gap-7 p-5 sm:p-8 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="panel-shadow flex flex-col gap-[22px] rounded-none border-2 border-ink bg-panel p-[22px] transition-colors lg:sticky lg:top-6">
          <SkillInput skills={config.skills} onChange={(skills) => update({ skills })} onError={notify} />
          <Controls config={config} update={update} />
        </aside>

        <section className="flex min-w-0 flex-col gap-6">
          <Preview config={config} />
          <CommandList skills={config.skills} installTemplate={config.installTemplate} onCopy={copyCmd} />
          {snippets && <ExportTabs snippets={snippets} />}
        </section>
      </main>

      {/* Toast: floats up bottom-center */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-7 left-1/2 max-w-[80vw] overflow-hidden rounded-none border-2 border-ink bg-toast px-4.5 py-2.5 font-mono text-xs font-bold whitespace-nowrap text-ellipsis text-toast-fg shadow-[4px_4px_0_var(--hard)] transition-all duration-250"
        style={{ transform: `translateX(-50%) translateY(${toast.on ? "0" : "12px"})`, opacity: toast.on ? 1 : 0 }}
      >
        {toast.msg || " "}
      </div>
    </div>
  );
}

// Brand mark: three stacked squares (yellow/pink/ink paper-cutout) + chevron; the front layer flips ink/page with the theme.
function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" className="block flex-none" aria-hidden="true">
      <rect x="11" y="11" width="19" height="19" rx="1" fill="#ffd440" />
      <rect x="6.5" y="6.5" width="19" height="19" rx="1" fill="#fe7da8" />
      <rect x="2" y="2" width="19" height="19" rx="1" fill="var(--ink)" />
      <path d="M8 7.5 L12.5 11.5 L8 15.5" stroke="var(--page-bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
