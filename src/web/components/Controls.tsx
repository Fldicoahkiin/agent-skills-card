import { MoonIcon as Moon, SunIcon as Sun } from "@phosphor-icons/react";
import { STYLE_META, type ShowcaseConfig } from "../../render";
import { cn, focusRing, press } from "../lib/utils";
import { useI18n, type TKey } from "../lib/i18n";
import { Input } from "../ui/input";
import { Segmented } from "../ui/segmented";

type Patch = Partial<ShowcaseConfig>;

const FORMS = ["full", "list", "grid", "banner"] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-[11px] font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{children}</div>;
}

// Control panel: card title / style tiles / card theme (segmented) / variant tiles / content toggles.
export function Controls({ config, update }: { config: ShowcaseConfig; update: (patch: Patch) => void }) {
  const { t } = useI18n();

  return (
    <>
      <div>
        <SectionLabel>{t("cardTitle")}</SectionLabel>
        <Input
          className="h-auto py-2.5 text-sm font-semibold"
          value={config.title ?? ""}
          placeholder="My Agent Skills"
          onChange={(e) => update({ title: e.target.value || null })}
        />
      </div>

      {/* 2px ink rules split the rail into content / appearance / output groups */}
      <div aria-hidden className="border-t-2" />

      <div>
        <SectionLabel>{t("style")}</SectionLabel>
        <div className="grid grid-cols-2 gap-[9px]">
          {STYLE_META.map((m) => {
            const on = config.style === m.key;
            return (
              <button
                type="button"
                key={m.key}
                onClick={() => update({ style: m.key })}
                aria-pressed={on}
                className={cn(
                  "flex cursor-pointer flex-col gap-2 rounded-none border-2 border-ink p-2.5 text-left",
                  press,
                  focusRing,
                  on ? "bg-tile-active hard-sm **:text-[#141111]" : "bg-tile hover:bg-chip",
                )}
              >
                <span className="flex gap-[3px]">
                  {m.sw.map((c) => (
                    <span key={c} className="size-[13px] rounded border border-black/10" style={{ background: c }} />
                  ))}
                </span>
                <span>
                  <span className="block text-[12.5px] font-bold text-ink">{m.name}</span>
                  <span className="mt-0.5 block font-mono text-[8.5px] text-faint">{m.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SectionLabel>{t("cardTheme")}</SectionLabel>
        <Segmented
          options={[
            { key: "light", label: t("light"), icon: <Sun className="size-3.5" /> },
            { key: "dark", label: t("dark"), icon: <Moon className="size-3.5" /> },
          ]}
          value={config.theme}
          onChange={(theme) => update({ theme })}
        />
      </div>

      <div>
        <SectionLabel>{t("form")}</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {FORMS.map((key) => {
            const on = config.variant === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => update({ variant: key })}
                aria-pressed={on}
                className={cn(
                  "cursor-pointer rounded-none border-2 border-ink px-[11px] py-[9px] text-left",
                  press,
                  focusRing,
                  on ? "bg-tile-active hard-sm **:text-[#141111]" : "bg-tile hover:bg-chip",
                )}
              >
                <span className="block text-[12.5px] font-bold text-ink">{t(`form_${key}` as TKey)}</span>
                <span className="mt-0.5 block font-mono text-[8.5px] text-faint">{t(`form_${key}_sub` as TKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div aria-hidden className="border-t-2" />

      <div className="flex flex-col gap-2.5">
        <SectionLabel>{t("content")}</SectionLabel>
        <ToggleRow label={t("tgDesc")} on={config.showDesc} onChange={(v) => update({ showDesc: v })} />
        <ToggleRow label={t("tgInstall")} on={config.showInstall} onChange={(v) => update({ showInstall: v })} />
      </div>

      {config.showInstall && (
        <div>
          <SectionLabel>{t("installCmd")}</SectionLabel>
          <Input
            className="font-mono text-[12px]"
            value={config.installTemplate}
            onChange={(e) => update({ installTemplate: e.target.value })}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {INSTALL_PRESETS.map((p) => {
              const on = config.installTemplate === p.tpl;
              return (
                <button
                  type="button"
                  key={p.tpl}
                  onClick={() => update({ installTemplate: p.tpl })}
                  className={cn(
                    "cursor-pointer rounded-none border-2 border-ink px-2 py-1 font-mono text-[10.5px] font-semibold",
                    press,
                    focusRing,
                    on ? "bg-tile-active text-[#141111]" : "bg-tile text-sub hover:text-ink",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 text-[11px] text-faint">{t("installHint")}</div>
        </div>
      )}
    </>
  );
}

// Install-command presets: npx skills add is the default; openskills and install.sh cover other distribution methods.
const INSTALL_PRESETS = [
  { label: "skills", tpl: "npx skills add {repo}" },
  { label: "openskills", tpl: "npx openskills install {repo}" },
  { label: "install.sh", tpl: "curl -fsSL https://raw.githubusercontent.com/{repo}/HEAD/install.sh | sh" },
];

// Switch row: square 34×20 track (lime when on) + square ink knob.
function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={cn("flex cursor-pointer items-center justify-between gap-2.5 border-none bg-transparent px-0 py-0.5 text-left", focusRing, "rounded-md")}
    >
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <span className={cn("relative h-5 w-[34px] flex-none rounded-none border-2 border-ink transition-colors", on ? "bg-lime" : "bg-track")}>
        <span
          className="absolute top-[1px] size-[14px] rounded-none bg-ink transition-[left]"
          style={{ left: on ? 15 : 1 }}
        />
      </span>
    </button>
  );
}
