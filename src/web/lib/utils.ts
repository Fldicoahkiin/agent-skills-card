import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// base → variants → conditionals → user overrides, merged in order with conflict resolution (same as shadcn).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Keyboard focus ring; every hand-rolled button site-wide uses this one (ui/Button has the same built in) — don't write new ones.
export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-cyan";

// Physical press feedback for hand-rolled interactive elements (ui/Button has its own). Replaces transition-colors —
// transition-property classes override each other, so transform must ride the same declaration. motion-safe honors reduced motion.
export const press =
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 motion-safe:active:scale-[0.98]";
