import { useRef, useState } from "react";
import { CodeIcon as Code, LinkIcon as Link, MarkdownLogoIcon as MarkdownLogo } from "@phosphor-icons/react";
import type { ExportSnippets } from "../../render";
import { copyText } from "../lib/clipboard";
import { useI18n, type TKey } from "../lib/i18n";
import { Segmented } from "../ui/segmented";
import { Button } from "../ui/button";

type Tab = "markdown" | "html" | "url";
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "markdown", label: "Markdown", icon: <MarkdownLogo className="size-3.5" /> },
  { key: "html", label: "HTML", icon: <Code className="size-3.5" /> },
  { key: "url", label: "URL", icon: <Link className="size-3.5" /> },
];

// Embed panel: Markdown / HTML / URL tabs + copy button (flashes green after copying) + code block + hint.
export function ExportTabs({ snippets }: { snippets: ExportSnippets }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("markdown");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const code = tab === "markdown" ? snippets.md : tab === "html" ? snippets.html : snippets.url;

  const copy = async () => {
    if (!(await copyText(code))) return; // no fake feedback on copy failure; the code block can still be selected by hand
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="panel-shadow rounded-none border-2 border-ink bg-panel p-5 transition-colors">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{t("embed")}</span>
          <Segmented options={TABS} value={tab} onChange={setTab} className="p-[3px]" />
        </div>
        <Button onClick={copy} className={copied ? "bg-lime" : undefined}>
          {copied ? t("copied") : t("copy")}
        </Button>
      </div>
      <pre className="m-0 overflow-auto rounded-none border-2 border-ink bg-field p-3.5 font-mono text-[12px] leading-relaxed break-all whitespace-pre-wrap text-ink">
        {code}
      </pre>
      <div className="mt-2.5 text-[12px] leading-normal text-sub">{t(`tab_${tab}` as TKey)}</div>
    </div>
  );
}
