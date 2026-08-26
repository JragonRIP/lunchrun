import type { AppSettings } from "@/lib/types";

export const BRAND = {
  name: "LUNCH RUN",
  tagline: "Snacks delivered. You relax.",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  service_fee: 1.5,
  min_merchandise: 3,
  max_merchandise: 20,
  max_items_per_order: 8,
  max_daily_orders: 20,
  default_cutoff: "11:30",
  default_delivery_window: "Lunch period",
  tax_mode: "simple",
  tax_rate: 0.0825,
  active_store_id: "store-dg",
  delivery_locations: [
    "Cafeteria",
    "Commons",
    "Hallway",
    "Outside cafeteria",
    "Other",
  ],
  payment_methods: ["Cash Prepay"],
  allow_custom_requests: true,
  allow_substitutions: true,
  promo_fee: null,
  promo_label: null,
  promo_active: false,
  test_mode: false,
};

export function effectiveServiceFee(settings: AppSettings): number {
  if (settings.promo_active && settings.promo_fee != null) {
    return settings.promo_fee;
  }
  return settings.service_fee;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: "Order received",
  shopping_soon: "Shopping soon",
  shopping: "Shopping",
  purchased: "Purchased",
  returning: "Returning to school",
  ready: "Ready for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PLACEHOLDER_IMAGE =
  "https://placehold.co/400x400/f5f5f5/1a1a1a?text=Snack";
