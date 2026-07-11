import { useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckIcon as Check,
  PlusIcon as Plus,
  SparkleIcon as Sparkles,
  SpinnerIcon as Spinner,
  StarIcon as Star,
  XIcon as X,
} from "@phosphor-icons/react";
import { parseRepo, parseUser, formatStars, type SkillEntry, type DiscoverRepo } from "../../render";
import { fetchRepoMeta } from "../lib/api";
import { cn, focusRing, press } from "../lib/utils";
import { useI18n } from "../lib/i18n";
import { hasRepo, addRepo, removeRepo, reorder, setDescOverride, addAllSkills as addAllSkillRepos } from "../lib/skill-list";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Skill repos section: chips (mono, with ×, drag to reorder, click the name to edit a custom description) + input + add;
// entering a username opens the discover panel for per-repo picking.
export function SkillInput({
  skills,
  onChange,
  onError,
}: {
  skills: SkillEntry[];
  onChange: (next: SkillEntry[]) => void;
  onError: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<{ user: string; repos: DiscoverRepo[] } | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // repo whose description is being edited
  const [draft, setDraft] = useState("");

  // Drag starts only after 6px of movement, so plain clicks on the inner buttons still work.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = skills.findIndex((s) => s.repo === e.active.id);
    const to = skills.findIndex((s) => s.repo === e.over?.id);
    if (from >= 0 && to >= 0) onChange(reorder(skills, from, to));
  };

  const has = (repo: string) => hasRepo(skills, repo);

  const submit = async () => {
    setFound(null); // collapse the previous discover panel on every submit so errors/new results don't stack on it
    const repo = parseRepo(input);
    if (repo) {
      if (has(repo)) return onError(t("errExists"));
      setBusy(true);
      const r = await fetchRepoMeta(repo);
      setBusy(false);
      if (!r.ok) return onError(r.kind === "notfound" ? t("errRepoNotFound") : t("errRequest"));
      onChange([...skills, { repo: r.meta.repo, name: r.meta.name, description: r.meta.description, stars: r.meta.stars }]);
      setInput("");
      return;
    }
    const user = parseUser(input);
    if (user) {
      setBusy(true);
      try {
        const res = await fetch(`/api/discover?user=${encodeURIComponent(user)}`);
        if (!res.ok) return onError(res.status === 404 ? t("errUserNotFound") : t("errRequest"));
        setFound({ user, repos: (await res.json()) as DiscoverRepo[] });
        setInput("");
      } catch {
        onError(t("errRequest"));
      } finally {
        setBusy(false);
      }
      return;
    }
    onError(t("errFormat"));
  };

  const toggleRepo = (r: DiscoverRepo) => onChange(has(r.repo) ? removeRepo(skills, r.repo) : addRepo(skills, r));
  const addAllSkills = () => onChange(addAllSkillRepos(skills, found?.repos ?? []));
  const skillCount = found?.repos.filter((r) => r.isSkill).length ?? 0;

  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{t("repos")}</div>
      <div className="mb-2.5 text-[11.5px] leading-normal text-sub">{t("reposHint")}</div>

      {skills.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={skills.map((s) => s.repo)} strategy={rectSortingStrategy}>
            <div className="mb-2.5 flex flex-wrap gap-[7px]">
              {skills.map((s) => (
                <SortableChip
                  key={s.repo}
                  skill={s}
                  onEdit={() => {
                    setEditing(editing === s.repo ? null : s.repo);
                    setDraft(s.descOverride ?? "");
                  }}
                  onRemove={() => {
                    if (editing === s.repo) setEditing(null);
                    onChange(removeRepo(skills, s.repo));
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editing && (
        <div className="mb-2.5">
          <Input
            autoFocus
            className="text-[12px]"
            placeholder={skills.find((s) => s.repo === editing)?.description || t("editDescPlaceholder")}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                if (e.key === "Enter") onChange(setDescOverride(skills, editing, draft));
                setEditing(null);
              }
            }}
            onBlur={() => {
              onChange(setDescOverride(skills, editing, draft));
              setEditing(null);
            }}
          />
          <div className="mt-1 text-[11px] text-faint">{t("editDescHint", { repo: editing })}</div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          className="min-w-0 flex-1 font-mono"
          placeholder={t("inputPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button onClick={submit} disabled={busy} className="shrink-0">
          {busy ? <Spinner className="size-4 animate-spin" /> : <Plus className="size-3.5" weight="bold" />}
          {t("addBtn")}
        </Button>
      </div>
      {found && (
        <div className="mt-3 overflow-hidden rounded-none border-2 border-ink">
          <div className="flex items-center justify-between gap-2 bg-chip px-3 py-2 text-[12px] text-sub">
            <span>
              <b className="text-ink">{found.user}</b> · {t("reposN", { n: found.repos.length })}
              {skillCount > 0 && <> · {t("skillsN", { n: skillCount })}</>}
            </span>
            <span className="flex items-center gap-1.5">
              {skillCount > 0 && (
                <Button size="sm" onClick={addAllSkills}>
                  <Sparkles className="size-3" />
                  {t("allSkills")}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setFound(null)}>
                {t("collapse")}
              </Button>
            </span>
          </div>
          {found.repos.length === 0 ? (
            <p className="px-3 py-3 text-[12.5px] text-sub">{t("noPublicRepos")}</p>
          ) : (
            <div className="flex max-h-60 flex-col gap-1.5 overflow-auto p-2">
              {found.repos.map((r) => {
                const added = has(r.repo);
                return (
                  <button
                    type="button"
                    key={r.repo}
                    onClick={() => toggleRepo(r)}
                    title={r.description || r.repo}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-none border-2 border-ink px-2.5 py-1.5 text-left text-[12.5px]",
                      press,
                      focusRing,
                      added ? "bg-tile-active **:text-[#141111]" : "bg-tile hover:bg-chip",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      {added && <Check className="size-3.5 shrink-0" weight="bold" />}
                      <span className="truncate font-mono text-ink">{r.name}</span>
                      {r.isSkill && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-none bg-cyan px-1.5 py-px font-mono text-[9.5px] font-bold text-[#141111]">
                          <Sparkles className="size-2.5" />
                          skill
                        </span>
                      )}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[11.5px] text-sub">
                      <Star weight="fill" className="size-3" />
                      {formatStars(r.stars)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// One sortable chip: dnd-kit drives the transform, so siblings slide into place live while dragging
// and the chip animates to its slot on drop.
function SortableChip({ skill, onEdit, onRemove }: { skill: SkillEntry; onEdit: () => void; onRemove: () => void }) {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.repo });
  return (
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      title={t("dragSort")}
      className={cn(
        "relative inline-flex cursor-grab touch-none items-center gap-2 rounded-none border-2 border-ink bg-chip py-[5px] pr-1.5 pl-[11px] font-mono text-[11.5px] font-semibold text-ink",
        isDragging && "z-10 cursor-grabbing opacity-80 hard-sm",
        skill.descOverride && "border-pink",
      )}
    >
      <button
        type="button"
        title={t("editDesc")}
        onClick={onEdit}
        className={cn("cursor-pointer border-none bg-transparent p-0 font-mono text-[11.5px] text-ink", focusRing, "rounded-none")}
      >
        {skill.repo}
      </button>
      <button
        type="button"
        aria-label={t("remove")}
        onClick={onRemove}
        className={cn(
          "flex size-[17px] cursor-pointer items-center justify-center rounded-none border-none bg-chip-x p-0 text-[#141111] hover:bg-pink",
          press,
          focusRing,
        )}
      >
        <X className="size-2.5" weight="bold" />
      </button>
    </span>
  );
}
