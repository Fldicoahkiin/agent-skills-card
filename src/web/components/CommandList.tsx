import { ArrowSquareOutIcon as ArrowSquareOut, CopyIcon as Copy } from "@phosphor-icons/react";
import { buildInstall, type SkillEntry } from "../../render";
import { cn, focusRing, press } from "../lib/utils";
import { useI18n } from "../lib/i18n";

// Install commands: the card in a README is a static image, and the draft's loop is visitors clicking the card back here to copy — this is the landing spot.
// One install command per repo + copy (toast feedback unified in App).
export function CommandList({
  skills,
  installTemplate,
  onCopy,
}: {
  skills: SkillEntry[];
  installTemplate: string;
  onCopy: (text: string, label: string) => void;
}) {
  const { t } = useI18n();
  if (!skills.length) return null;

  return (
    <div className="panel-shadow rounded-none border-2 border-ink bg-panel p-5 transition-colors">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">{t("commands")}</span>
      </div>
      <p className="mb-3 text-[12px] leading-normal text-sub">{t("commandsHint")}</p>
      <div className="flex flex-col">
        {skills.map((s, i) => {
          const cmd = buildInstall(installTemplate, s.repo);
          return (
            <div key={s.repo} className={cn("flex items-center justify-between gap-3 py-2", i > 0 && "border-t")}>
              <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">{cmd}</code>
              <span className="flex shrink-0 items-center gap-0.5">
                <a
                  href={`https://github.com/${s.repo}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("openRepo")}
                  title={`github.com/${s.repo}`}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-none text-sub hover:bg-chip hover:text-ink",
                    press,
                    focusRing,
                  )}
                >
                  <ArrowSquareOut className="size-3.5" />
                </a>
                <button
                  type="button"
                  aria-label={t("copyCmd")}
                  onClick={() => onCopy(cmd, s.repo)}
                  className={cn(
                    "flex size-7 cursor-pointer items-center justify-center rounded-none border-none bg-transparent text-sub hover:bg-chip hover:text-ink",
                    press,
                    focusRing,
                  )}
                >
                  <Copy className="size-3.5" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
