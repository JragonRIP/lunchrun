"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/store/cart";
import type { SubstitutionPreference } from "@/lib/types";
import { SUBSTITUTION_LABELS } from "@/lib/utils";

export function CustomItemModal({
  open,
  onClose,
  orderingOpen,
}: {
  open: boolean;
  onClose: () => void;
  orderingOpen: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [flavor, setFlavor] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [maxPrice, setMaxPrice] = useState(5);
  const [substitution, setSubstitution] =
    useState<SubstitutionPreference>("closest_under_max");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
        <h2 className="text-xl font-black">Custom item request</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Tell us what to look for. We&apos;ll try our best within your max.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-bold">Item name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Large bag of Flamin' Hot Cheetos"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-bold">Brand</label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">Size</label>
              <Input value={size} onChange={(e) => setSize(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Flavor</label>
            <Input value={flavor} onChange={(e) => setFlavor(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any similar hot chips under $5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Maximum price</label>
            <Input
              type="number"
              step="0.25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Substitution</label>
            <Select
              value={substitution}
              onChange={(e) =>
                setSubstitution(e.target.value as SubstitutionPreference)
              }
            >
              {(Object.keys(SUBSTITUTION_LABELS) as SubstitutionPreference[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {SUBSTITUTION_LABELS[key]}
                  </option>
                ),
              )}
            </Select>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!orderingOpen || name.trim().length < 2}
            onClick={() => {
              addItem({
                productId: null,
                isCustom: true,
                name: name.trim(),
                brand: brand || null,
                size: size || null,
                flavor: flavor || null,
                description: description || null,
                imageUrl: null,
                quantity: 1,
                estimatedPrice: null,
                minEstimated: null,
                maxEstimated: maxPrice,
                maxPrice,
                substitution,
              });
              toast.success("Custom item added");
              setName("");
              onClose();
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
