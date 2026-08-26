"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, SubstitutionPreference } from "@/lib/types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateMaxPrice: (key: string, maxPrice: number) => void;
  updateSubstitution: (key: string, substitution: SubstitutionPreference) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  itemCount: () => number;
}

function makeKey(item: Omit<CartItem, "key">): string {
  if (item.isCustom) {
    return `custom-${item.name}-${item.maxPrice}-${Date.now()}`;
  }
  return `product-${item.productId}-${item.substitution}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const key = makeKey(item);
        set((state) => {
          const existing = state.items.find(
            (i) =>
              !item.isCustom &&
              i.productId === item.productId &&
              i.substitution === item.substitution &&
              i.maxPrice === item.maxPrice,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === existing.key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, key }] };
        });
      },
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity } : i,
          ),
        }));
      },
      updateMaxPrice: (key, maxPrice) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, maxPrice } : i,
          ),
        })),
      updateSubstitution: (key, substitution) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, substitution } : i,
          ),
        })),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "lunch-run-cart" },
  ),
);

interface PreferencesState {
  name: string;
  location: string;
  setName: (name: string) => void;
  setLocation: (location: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      name: "",
      location: "Cafeteria",
      setName: (name) => set({ name }),
      setLocation: (location) => set({ location }),
    }),
    { name: "lunch-run-prefs" },
  ),
);
