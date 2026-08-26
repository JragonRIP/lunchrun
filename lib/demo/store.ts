import {
  DEMO_CATEGORIES,
  DEMO_IMPORT_LOGS,
  DEMO_ORDERS,
  DEMO_PENDING_MATCHES,
  DEMO_PRICE_HISTORY,
  DEMO_PRODUCTS,
  DEMO_SESSION,
  DEMO_SETTINGS,
  DEMO_STORES,
} from "@/lib/demo/seed";
import { effectiveServiceFee } from "@/lib/constants";
import { recalculateOrderTotals as recalcShared, shoppingItemKey } from "@/lib/order-money";
import type {
  AppSettings,
  Category,
  LunchRunSession,
  Order,
  OrderItem,
  PendingProductMatch,
  PriceHistoryEntry,
  PriceImportLog,
  Product,
  ShoppingListItem,
  Store,
} from "@/lib/types";
import {
  generateOrderCode,
  generateTrackingToken,
  roundMoney,
} from "@/lib/utils";

export interface DemoState {
  stores: Store[];
  categories: Category[];
  products: Product[];
  session: LunchRunSession;
  orders: Order[];
  settings: AppSettings;
  priceHistory: PriceHistoryEntry[];
  importLogs: PriceImportLog[];
  pendingMatches: PendingProductMatch[];
  orderSeq: number;
  adminLoggedIn: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __lunchRunDemo: DemoState | undefined;
}

function cloneOrders(orders: Order[]): Order[] {
  return orders.map((o) => ({
    ...o,
    items: o.items?.map((i) => ({ ...i })),
  }));
}

function createInitialState(): DemoState {
  return {
    stores: DEMO_STORES.map((s) => ({ ...s })),
    categories: DEMO_CATEGORIES.map((c) => ({ ...c })),
    products: DEMO_PRODUCTS.map((p) => ({ ...p })),
    session: { ...DEMO_SESSION },
    orders: cloneOrders(DEMO_ORDERS),
    settings: { ...DEMO_SETTINGS },
    priceHistory: DEMO_PRICE_HISTORY.map((p) => ({ ...p })),
    importLogs: [...DEMO_IMPORT_LOGS],
    pendingMatches: [...DEMO_PENDING_MATCHES],
    orderSeq: 1050,
    adminLoggedIn: false,
  };
}

import { isDemoMode } from "@/lib/supabase/config";

export function getDemoState(): DemoState {
  if (!globalThis.__lunchRunDemo) {
    globalThis.__lunchRunDemo = createInitialState();
  }
  return globalThis.__lunchRunDemo;
}

export function resetDemoState() {
  globalThis.__lunchRunDemo = createInitialState();
}

export { isDemoMode };

export function getActiveServiceFee(state = getDemoState()): number {
  return effectiveServiceFee(state.settings);
}

export function buildShoppingList(orders?: Order[]): ShoppingListItem[] {
  const state = getDemoState();
  const list =
    orders ??
    state.orders.filter((o) =>
      ["received", "shopping_soon", "shopping"].includes(o.status),
    );
  const map = new Map<string, ShoppingListItem>();

  for (const order of list) {
    for (const item of order.items ?? []) {
      if (item.status === "skipped" || item.status === "unavailable") continue;
      const key = shoppingItemKey(item);
      const product = item.product_id
        ? state.products.find((p) => p.id === item.product_id)
        : undefined;
      const category = product
        ? state.categories.find((c) => c.id === product.category_id)
        : state.categories.find((c) => c.id === "cat-other");

      const existing = map.get(key);
      const customer = {
        orderId: order.id,
        orderItemId: item.id,
        customerName: order.customer_name,
        quantity: item.quantity,
        maxPrice: item.max_price,
        substitution: item.substitution,
      };

      if (existing) {
        existing.totalQty += item.quantity;
        existing.customers.push(customer);
        existing.pickedUp = existing.pickedUp && item.picked_up;
        if (item.actual_price != null) existing.actualPrice = item.actual_price;
      } else {
        map.set(key, {
          productKey: key,
          productId: item.product_id,
          name: item.product_name,
          brand: item.brand,
          size: item.size,
          flavor: item.flavor,
          imageUrl: item.image_url ?? product?.image_url ?? null,
          categoryId: category?.id ?? null,
          categoryName: category?.name ?? "Other",
          shoppingOrder: category?.shopping_order ?? 99,
          totalQty: item.quantity,
          knownPrice: item.estimated_price ?? product?.current_price ?? null,
          customers: [customer],
          pickedUp: item.picked_up,
          actualPrice: item.actual_price,
          unavailable: false,
        });
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.shoppingOrder - b.shoppingOrder || a.name.localeCompare(b.name),
  );
}

export function createDemoOrder(input: {
  customerName: string;
  deliveryLocation: string;
  deliveryLocationOther?: string | null;
  paymentMethod: string;
  notes?: string | null;
  tipAmount?: number;
  items: Array<Omit<OrderItem, "id" | "order_id" | "status" | "picked_up" | "tax_amount" | "actual_price" | "replacement_name" | "replacement_price" | "substitution_notes"> & Partial<OrderItem>>;
}): Order {
  const state = getDemoState();
  const fee = getActiveServiceFee(state);
  const id = `ord-${Date.now()}`;
  const code = generateOrderCode(state.orderSeq++);
  const token = generateTrackingToken();

  const merchMin = roundMoney(
    input.items.reduce(
      (sum, i) => sum + (i.min_estimated ?? i.estimated_price ?? 0) * i.quantity,
      0,
    ),
  );
  const merchMax = roundMoney(
    input.items.reduce(
      (sum, i) => sum + (i.max_estimated ?? i.estimated_price ?? i.max_price) * i.quantity,
      0,
    ),
  );
  const maxAuth = roundMoney(
    input.items.reduce((sum, i) => sum + i.max_price * i.quantity, 0) +
      fee +
      (input.tipAmount ?? 0),
  );

  const items: OrderItem[] = input.items.map((item, idx) => ({
    id: `${id}-item-${idx}`,
    order_id: id,
    product_id: item.product_id ?? null,
    is_custom: item.is_custom ?? false,
    product_name: item.product_name,
    brand: item.brand ?? null,
    size: item.size ?? null,
    flavor: item.flavor ?? null,
    description: item.description ?? null,
    quantity: item.quantity,
    estimated_price: item.estimated_price ?? null,
    min_estimated: item.min_estimated ?? null,
    max_estimated: item.max_estimated ?? null,
    max_price: item.max_price,
    actual_price: null,
    tax_amount: 0,
    substitution: item.substitution ?? "closest_under_max",
    substitution_notes: item.substitution_notes ?? null,
    status: "pending",
    replacement_name: null,
    replacement_price: null,
    picked_up: false,
    image_url: item.image_url ?? null,
  }));

  const order: Order = {
    id,
    order_code: code,
    tracking_token: token,
    session_id: state.session.id,
    customer_name: input.customerName,
    delivery_location: input.deliveryLocation,
    delivery_location_other: input.deliveryLocationOther ?? null,
    payment_method: input.paymentMethod,
    notes: input.notes ?? null,
    tip_amount: input.tipAmount ?? 0,
    status: "received",
    payment_status: "unpaid",
    merchandise_estimate_min: merchMin,
    merchandise_estimate_max: merchMax,
    merchandise_actual: null,
    tax_amount: 0,
    service_fee: fee,
    estimated_total_min: roundMoney(merchMin + fee + (input.tipAmount ?? 0)),
    estimated_total_max: roundMoney(merchMax + fee + (input.tipAmount ?? 0)),
    final_total: null,
    max_authorized_total: maxAuth,
    amount_paid: 0,
    change_owed: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    delivered_at: null,
    items,
  };

  state.orders.unshift(order);
  return order;
}

export function recalculateOrderTotals(order: Order, settings?: AppSettings) {
  const state = getDemoState();
  const s = settings ?? state.settings;
  return recalcShared(order, s);
}

export function distributeShelfPrice(
  productKey: string,
  actualPrice: number,
  options?: { markFound?: boolean },
) {
  const state = getDemoState();
  const list = buildShoppingList();
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return { warnings: ["Item not found"] as string[] };

  const warnings: string[] = [];
  for (const customer of group.customers) {
    const order = state.orders.find((o) => o.id === customer.orderId);
    const item = order?.items?.find((i) => i.id === customer.orderItemId);
    if (!order || !item) continue;

    if (actualPrice > item.max_price) {
      warnings.push(
        `${customer.customerName}: shelf ${actualPrice} exceeds max ${item.max_price}`,
      );
      continue;
    }

    item.actual_price = actualPrice;
    if (options?.markFound !== false) {
      item.picked_up = true;
      item.status = "found";
    }
    recalculateOrderTotals(order);
  }

  return { warnings };
}

export function markItemUnavailable(productKey: string) {
  const state = getDemoState();
  const list = buildShoppingList();
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return;

  for (const customer of group.customers) {
    const order = state.orders.find((o) => o.id === customer.orderId);
    const item = order?.items?.find((i) => i.id === customer.orderItemId);
    if (!item) continue;
    item.status = "unavailable";
    item.picked_up = false;
    if (order) recalculateOrderTotals(order);
  }
}

export function recordSubstitution(input: {
  orderItemId: string;
  replacementName: string;
  replacementPrice: number;
}) {
  const state = getDemoState();
  for (const order of state.orders) {
    const item = order.items?.find((i) => i.id === input.orderItemId);
    if (!item) continue;
    if (input.replacementPrice > item.max_price) {
      return { ok: false as const, error: "Replacement exceeds customer maximum" };
    }
    item.replacement_name = input.replacementName;
    item.replacement_price = input.replacementPrice;
    item.actual_price = input.replacementPrice;
    item.status = "substituted";
    item.picked_up = true;
    recalculateOrderTotals(order);
    return { ok: true as const };
  }
  return { ok: false as const, error: "Item not found" };
}
