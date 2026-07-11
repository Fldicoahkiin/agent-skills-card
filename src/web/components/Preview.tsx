import { useMemo } from "react";
import { renderSvg, STYLE_META, type ShowcaseConfig } from "../../render";
import { useI18n, type TKey } from "../lib/i18n";

function dataUri(svg: string): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Preview board: dot-grid backdrop, live isomorphic renderSvg, card centered; a style · theme · variant caption below.
export function Preview({ config }: { config: ShowcaseConfig }) {
  const { t } = useI18n();
  const svg = useMemo(() => (config.skills.length ? renderSvg(config) : null), [config]);
  const styleName = STYLE_META.find((m) => m.key === config.style)?.name ?? config.style;

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
        <img
          src={dataUri(svg)}
          alt={config.title || "My Agent Skills"}
          className="max-w-full [filter:drop-shadow(0_14px_30px_rgba(28,26,23,0.22))]"
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
