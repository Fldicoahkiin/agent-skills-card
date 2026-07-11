import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

// Buttons: 2px ink border + hard offset shadow; hover lifts, active presses into the page (press-sm).
// primary = pink candy fill with fixed dark ink (candy fills are theme-invariant), outline = panel fill, ghost = borderless.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-bold outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "border-2 border-ink bg-pink text-[#141111] hard-sm press-sm",
        outline: "border-2 border-ink bg-panel text-ink hard-sm press-sm",
        ghost: "text-sub hover:bg-chip hover:text-ink transition-colors duration-150",
      },
      size: {
        sm: "h-7 rounded-none px-2.5 text-xs",
        md: "h-9 rounded-none px-4 text-[12.5px]",
        icon: "size-8 rounded-none",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return <button type={type ?? "button"} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
