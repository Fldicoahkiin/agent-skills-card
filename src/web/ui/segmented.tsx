import { cn, focusRing, press } from "../lib/utils";

// Segmented control: seg trough + solid btn color on the active item. Shared by the card-theme picker and export tabs.
// Tab convention: a small icon left of the label (optional).
export function Segmented<K extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { key: K; label: string; icon?: React.ReactNode }[];
  value: K;
  onChange: (k: K) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1 rounded-none border-2 border-ink bg-seg p-1", className)}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            type="button"
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={on}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none border-none px-3 py-1.5 font-mono text-[11.5px] font-bold",
              press,
              focusRing,
              on ? "bg-btn text-btn-fg" : "bg-transparent text-sub hover:text-ink",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
