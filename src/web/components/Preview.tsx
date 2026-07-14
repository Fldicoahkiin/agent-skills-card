import { useEffect, useMemo, useRef } from "react";
import { renderSvg, STYLE_META, type ShowcaseConfig } from "../../render";
import { useI18n, type TKey } from "../lib/i18n";

// Preview board: dot-grid backdrop, live isomorphic renderSvg inlined so the on-site card is interactive —
// clicking a skill row opens its repo (the SVG's own <a>), clicking a command chip copies it (data-cmd).
// The README embed stays a static <img>; this interactivity is site-only and can't travel through camo.
export function Preview({ config, onCopy }: { config: ShowcaseConfig; onCopy: (text: string, label: string) => void }) {
  const { t } = useI18n();
  const svg = useMemo(() => (config.skills.length ? renderSvg(config) : null), [config]);
  const styleName = STYLE_META.find((m) => m.key === config.style)?.name ?? config.style;

  const hostRef = useRef<HTMLDivElement>(null);
  const onCopyRef = useRef(onCopy);
  onCopyRef.current = onCopy;

  // Inline the SVG string (our own escapeXml'd output — no <script>/handlers, so no injection vector) and
  // delegate clicks: a command chip copies (and cancels the enclosing repo link); anything else falls
  // through to the row's <a href> and opens the repo.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = svg ?? "";
    if (!svg) return;
    const onClick = (e: MouseEvent) => {
      const chip = (e.target as Element).closest?.("[data-cmd]");
      if (!chip) return;
      e.preventDefault();
      const cmd = chip.getAttribute("data-cmd") ?? "";
      if (cmd) onCopyRef.current(cmd, cmd);
    };
    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [svg]);

  return (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-none border-2 border-ink px-7 py-9 transition-colors"
      style={{
        backgroundColor: "var(--board-bg)",
        backgroundImage: "radial-gradient(var(--board-dot) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {svg ? (
        <div
          ref={hostRef}
          className="max-w-full [filter:drop-shadow(0_14px_30px_rgba(28,26,23,0.22))] [&>svg]:h-auto [&>svg]:max-w-full [&_[data-cmd]]:cursor-pointer [&_a]:cursor-pointer"
        />
      ) : (
        <p className="text-[13px] text-sub">{t("previewEmpty")}</p>
      )}
      <div className="font-mono text-[10.5px] tracking-[0.1em] text-faint">
        {styleName} · {t(config.theme === "dark" ? "dark" : "light")} · {t(`form_${config.variant}` as TKey)} — {t(`hint_${config.variant}` as TKey)}
      </div>
    </div>
  );
}
