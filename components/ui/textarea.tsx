import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base text-lr-black placeholder:text-neutral-400 outline-none transition focus:border-lr-black focus:ring-2 focus:ring-lr-yellow/50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
