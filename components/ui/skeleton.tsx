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
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading menu">
      <Skeleton className="h-40 w-full rounded-3xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading orders">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

export function AdminPageSkeleton({
  cards = 4,
  rows = 5,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-3xl" />
        ))}
      </div>
      <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
