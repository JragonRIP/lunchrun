import { cn } from "@/lib/utils";
import { Footprints } from "lucide-react";

export function Logo({
  className,
  size = "md",
  light = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-lr-yellow text-lr-black",
          size === "lg" ? "h-10 w-10" : size === "sm" ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <Footprints className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
      <span
        className={cn(
          "font-black italic tracking-tight",
          sizes[size],
          light ? "text-white" : "text-lr-black",
        )}
      >
        LUNCH RUN
      </span>
    </div>
  );
}
