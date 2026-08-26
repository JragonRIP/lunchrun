"use client";

import Image from "next/image";
import {
  Candy,
  Coffee,
  Cookie,
  Droplets,
  Package,
  Popcorn,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, typeof Package> = {
  drinks: Droplets,
  "energy-drinks": Zap,
  chips: Popcorn,
  candy: Candy,
  jerky: Package,
  snacks: Cookie,
  gum: Candy,
  other: Package,
  coffee: Coffee,
};

function categoryTone(slug?: string | null): string {
  switch (slug) {
    case "drinks":
      return "bg-sky-100 text-sky-800";
    case "energy-drinks":
      return "bg-lime-100 text-lime-900";
    case "chips":
      return "bg-orange-100 text-orange-900";
    case "candy":
      return "bg-pink-100 text-pink-900";
    case "jerky":
      return "bg-amber-100 text-amber-950";
    case "snacks":
      return "bg-yellow-100 text-yellow-950";
    case "gum":
      return "bg-violet-100 text-violet-900";
    default:
      return "bg-neutral-100 text-neutral-700";
  }
}

export function ProductThumb({
  name,
  imageUrl,
  categorySlug,
  size = "md",
  className,
}: {
  name: string;
  imageUrl?: string | null;
  categorySlug?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "lg" ? "h-24 w-24" : size === "sm" ? "h-12 w-12" : "h-16 w-16";
  const Icon = CATEGORY_ICONS[categorySlug ?? ""] ?? Package;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-xl bg-neutral-100",
          dim,
          className,
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "lg" ? "96px" : "64px"}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl",
        dim,
        categoryTone(categorySlug),
        className,
      )}
      aria-hidden={false}
      role="img"
      aria-label={name}
    >
      <Icon className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} aria-hidden />
      <span className="text-[10px] font-black tracking-wide">{initials || "LR"}</span>
    </div>
  );
}
