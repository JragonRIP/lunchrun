"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { archiveProductAction, saveProductAction } from "@/lib/actions";
import type { Category, Product } from "@/lib/types";
import { formatMoney, freshnessLabel, getPriceFreshness } from "@/lib/utils";

const emptyForm = {
  name: "",
  brand: "",
  size: "",
  flavor: "",
  category_id: "",
  current_price: "",
  min_price: "",
  max_price: "",
  image_url: "",
  popularity: "50",
};

export function ProductsClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...emptyForm,
    category_id: categories[0]?.id ?? "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Products</h1>
        <p className="text-neutral-500">Manage catalog items</p>
      </div>

      <form
        className="grid gap-3 rounded-3xl border bg-white p-5 shadow-sm md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            await saveProductAction({
              id: editingId ?? undefined,
              name: form.name,
              brand: form.brand || null,
              size: form.size || null,
              flavor: form.flavor || null,
              category_id: form.category_id,
              current_price: form.current_price ? Number(form.current_price) : null,
              min_price: form.min_price ? Number(form.min_price) : null,
              max_price: form.max_price ? Number(form.max_price) : null,
              image_url: form.image_url || null,
              popularity: Number(form.popularity) || 50,
              last_price_update: form.current_price
                ? new Date().toISOString()
                : undefined,
            });
            toast.success(editingId ? "Product updated" : "Product created");
            setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
            setEditingId(null);
            router.refresh();
          });
        }}
      >
        <h2 className="md:col-span-2 font-black">
          {editingId ? "Edit product" : "Add product"}
        </h2>
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          placeholder="Brand"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
        />
        <Input
          placeholder="Size"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />
        <Input
          placeholder="Flavor"
          value={form.flavor}
          onChange={(e) => setForm({ ...form, flavor: e.target.value })}
        />
        <Select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Current price"
          value={form.current_price}
          onChange={(e) => setForm({ ...form, current_price: e.target.value })}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Min estimate"
          value={form.min_price}
          onChange={(e) => setForm({ ...form, min_price: e.target.value })}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="Max estimate"
          value={form.max_price}
          onChange={(e) => setForm({ ...form, max_price: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Popularity 0-100"
          value={form.popularity}
          onChange={(e) => setForm({ ...form, popularity: e.target.value })}
        />
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={pending}>
            {editingId ? "Save changes" : "Create product"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm, category_id: categories[0]?.id ?? "" });
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {products.map((p) => {
          const freshness = getPriceFreshness(p.last_price_update);
          return (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3"
            >
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-neutral-500">
                  {p.brand} · {p.size} ·{" "}
                  {p.current_price != null ? formatMoney(p.current_price) : "—"}
                </p>
                <p className="text-xs text-neutral-400">
                  {freshnessLabel(p.last_price_update)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    freshness === "fresh"
                      ? "success"
                      : freshness === "aging"
                        ? "warning"
                        : "danger"
                  }
                >
                  {freshness}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(p.id);
                    setForm({
                      name: p.name,
                      brand: p.brand ?? "",
                      size: p.size ?? "",
                      flavor: p.flavor ?? "",
                      category_id: p.category_id,
                      current_price:
                        p.current_price != null ? String(p.current_price) : "",
                      min_price: p.min_price != null ? String(p.min_price) : "",
                      max_price: p.max_price != null ? String(p.max_price) : "",
                      image_url: p.image_url ?? "",
                      popularity: String(p.popularity),
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    startTransition(async () => {
                      await archiveProductAction(p.id);
                      toast.message("Archived");
                      router.refresh();
                    })
                  }
                >
                  Archive
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
