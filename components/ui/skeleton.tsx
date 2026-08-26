import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-neutral-200/80",
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3">
      <Skeleton className="h-16 w-16 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-10 w-10 rounded-xl" />
    </div>
  );
}
