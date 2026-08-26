import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-base text-lr-black placeholder:text-neutral-400 outline-none transition focus:border-lr-black focus:ring-2 focus:ring-lr-yellow/50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
