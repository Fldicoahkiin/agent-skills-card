import { cn } from "../lib/utils";

// Input: square field, 2px ink border, cyan ring on focus.
export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-none border-2 border-ink bg-field px-3 text-[12.5px] text-ink outline-none transition-shadow focus:ring-2 focus:ring-cyan",
        className,
      )}
      {...props}
    />
  );
}
