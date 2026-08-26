import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white px-4 text-base text-lr-black outline-none transition focus:border-lr-black focus:ring-2 focus:ring-lr-yellow/50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
