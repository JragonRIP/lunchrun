import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-lr-yellow text-lr-black hover:bg-yellow-300 active:scale-[0.98] shadow-sm",
  secondary: "bg-lr-black text-white hover:bg-neutral-800 active:scale-[0.98]",
  ghost: "bg-transparent text-lr-black hover:bg-neutral-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline:
    "border-2 border-lr-black bg-white text-lr-black hover:bg-neutral-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-2xl",
  lg: "h-13 px-5 text-base rounded-2xl min-h-[52px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold tracking-tight transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lr-yellow focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
