"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedOrder {
  token: string;
  orderCode: string;
  customerName: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
  itemCount: number;
  maxAuthorized: number;
  estimatedMin: number;
  estimatedMax: number;
  location: string;
}

interface MyOrdersState {
  orders: SavedOrder[];
  saveOrder: (order: SavedOrder) => void;
  removeOrder: (token: string) => void;
  clear: () => void;
}

export const useMyOrdersStore = create<MyOrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      saveOrder: (order) => {
        const rest = get().orders.filter((o) => o.token !== order.token);
        set({ orders: [order, ...rest].slice(0, 20) });
      },
      removeOrder: (token) =>
        set({ orders: get().orders.filter((o) => o.token !== token) }),
      clear: () => set({ orders: [] }),
    }),
    { name: "lunch-run-my-orders" },
  ),
);

export function toSavedOrder(order: {
  tracking_token: string;
  order_code: string;
  customer_name: string;
  created_at: string;
  max_authorized_total: number;
  estimated_total_min: number;
  estimated_total_max: number;
  delivery_location: string;
  delivery_location_other: string | null;
  items?: Array<{ product_name: string; quantity: number }>;
}): SavedOrder {
  const items = (order.items ?? []).map((i) => ({
    name: i.product_name,
    quantity: i.quantity,
  }));
  return {
    token: order.tracking_token,
    orderCode: order.order_code,
    customerName: order.customer_name,
    createdAt: order.created_at,
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    maxAuthorized: order.max_authorized_total,
    estimatedMin: order.estimated_total_min,
    estimatedMax: order.estimated_total_max,
    location: order.delivery_location_other || order.delivery_location,
  };
}
