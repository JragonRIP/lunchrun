"use client";

import {
  Beef,
  Candy,
  CircleDot,
  Cookie,
  CupSoda,
  Package,
  Popcorn,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  CupSoda,
  Zap,
  Cookie,
  Candy,
  Beef,
  Popcorn,
  CircleDot,
  Package,
};

export function CategoryChips({
  categories,
  active,
  onSelect,
}: {
  categories: Category[];
  active: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
          active === null
            ? "bg-lr-black text-white"
            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
        )}
      >
        All
      </button>
      {categories.map((cat) => {
        const Icon = (cat.icon && ICONS[cat.icon]) || Package;
        const isActive = active === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition",
              isActive
                ? "bg-lr-black text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
            )}
          >
            <Icon className="h-4 w-4" />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
