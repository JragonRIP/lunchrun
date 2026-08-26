"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { CategoryChips } from "@/components/customer/category-chips";
import { ProductCard } from "@/components/customer/product-card";
import { ProductDetailSheet } from "@/components/customer/product-detail-sheet";
import { CustomItemModal } from "@/components/customer/custom-item-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  AppSettings,
  Category,
  LunchRunSession,
  ProductWithCategory,
  Store,
} from "@/lib/types";
import { RunStatusCard } from "@/components/customer/run-status-card";
import { HowItWorks } from "@/components/customer/how-it-works";

type SortKey = "popular" | "price" | "drinks" | "snacks" | "updated";

export function CatalogClient({
  products,
  categories,
  session,
  store,
  settings,
  orderingOpen,
  orderCount,
  demo,
}: {
  products: ProductWithCategory[];
  categories: Category[];
  session: LunchRunSession;
  store: Store | null;
  settings: AppSettings;
  orderingOpen: boolean;
  orderCount: number;
  demo: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("popular");
  const [selected, setSelected] = useState<ProductWithCategory | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (categoryId && p.category_id !== categoryId) return false;
      if (!q) return true;
      const hay = [p.name, p.brand, p.flavor, p.size, p.category?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price":
          return (a.current_price ?? 999) - (b.current_price ?? 999);
        case "updated":
          return (
            new Date(b.last_price_update ?? 0).getTime() -
            new Date(a.last_price_update ?? 0).getTime()
          );
        case "drinks":
          return Number(b.category?.slug?.includes("drink")) -
            Number(a.category?.slug?.includes("drink"));
        case "snacks":
          return Number(["chips", "candy", "snacks", "jerky"].includes(b.category?.slug ?? "")) -
            Number(["chips", "candy", "snacks", "jerky"].includes(a.category?.slug ?? ""));
        default:
          return b.popularity - a.popularity;
      }
    });

    return list;
  }, [products, query, categoryId, sort]);

  return (
    <div className="space-y-6">
      {demo ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo mode — sample data is active. Connect Supabase for production.
        </div>
      ) : null}

      <RunStatusCard
        session={session}
        store={store}
        orderingOpen={orderingOpen}
        orderCount={orderCount}
        maxOrders={session.max_orders || settings.max_daily_orders}
      />

      <HowItWorks />

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            startTransition(() => setQuery(v));
          }}
          placeholder="Search for snacks, drinks, etc."
          className="pl-11"
          aria-label="Search products"
        />
      </div>

      <CategoryChips
        categories={categories}
        active={categoryId}
        onSelect={setCategoryId}
      />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black tracking-tight">
          {pending ? "Searching…" : "Popular Items"}
        </h2>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-10 w-auto min-w-[140px] text-sm"
          aria-label="Sort products"
        >
          <option value="popular">Popular</option>
          <option value="price">Lowest price</option>
          <option value="drinks">Drinks first</option>
          <option value="snacks">Snacks first</option>
          <option value="updated">Recently updated</option>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Couldn't find that snack. Try a custom request."
            action={
              settings.allow_custom_requests ? (
                <Button onClick={() => setCustomOpen(true)}>Can't find it?</Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(p) => {
                if (!orderingOpen) {
                  toast.error("Today's ordering has closed.");
                  return;
                }
                setSelected(p);
              }}
            />
          ))
        )}
      </div>

      {settings.allow_custom_requests ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            if (!orderingOpen) {
              toast.error("Today's ordering has closed.");
              return;
            }
            setCustomOpen(true);
          }}
        >
          Can&apos;t find it? Request a custom item
        </Button>
      ) : null}

      <ProductDetailSheet
        product={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        orderingOpen={orderingOpen}
      />
      <CustomItemModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        orderingOpen={orderingOpen}
      />
    </div>
  );
}
