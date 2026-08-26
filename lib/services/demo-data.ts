import {
  buildShoppingList,
  createDemoOrder,
  distributeShelfPrice,
  getActiveServiceFee,
  getDemoState,
  isDemoMode,
  markItemUnavailable,
  recalculateOrderTotals,
  recordSubstitution,
} from "@/lib/demo/store";
import { isOrderingOpen } from "@/lib/ordering";
import type {
  AppSettings,
  Category,
  LunchRunSession,
  Order,
  PriceImportItem,
  Product,
  ProductWithCategory,
  ShoppingListItem,
  Store,
} from "@/lib/types";
import { normalizeProductKey, roundMoney, sanitizeText } from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validation/schemas";

export { isDemoMode, isOrderingOpen };

export async function getCatalog(): Promise<{
  products: ProductWithCategory[];
  categories: Category[];
  stores: Store[];
  session: LunchRunSession;
  settings: AppSettings;
  store: Store | null;
  orderingOpen: boolean;
  orderCount: number;
  demo: boolean;
}> {
  const state = getDemoState();
  const categories = state.categories.filter((c) => c.active).sort((a, b) => a.sort_order - b.sort_order);
  const products: ProductWithCategory[] = state.products
    .filter((p) => p.active && !p.archived)
    .map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.category_id),
      store: state.stores.find((s) => s.id === p.store_id) ?? null,
    }))
    .sort((a, b) => b.popularity - a.popularity);

  const store =
    state.stores.find((s) => s.id === state.session.store_id) ??
    state.stores.find((s) => s.is_default) ??
    null;

  const orderingOpen = isOrderingOpen(state.session, state.settings, state.orders.length);

  return {
    products,
    categories,
    stores: state.stores,
    session: state.session,
    settings: state.settings,
    store,
    orderingOpen,
    orderCount: state.orders.filter((o) => o.status !== "cancelled").length,
    demo: isDemoMode(),
  };
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const state = getDemoState();
  return state.orders.find((o) => o.tracking_token === token) ?? null;
}

export async function findOrderByCodeAndName(
  code: string,
  name: string,
): Promise<Order | null> {
  const state = getDemoState();
  const normalized = name.trim().toLowerCase();
  return (
    state.orders.find(
      (o) =>
        o.order_code.toLowerCase() === code.trim().toLowerCase() &&
        o.customer_name.toLowerCase() === normalized,
    ) ?? null
  );
}

export async function submitOrder(input: CheckoutInput): Promise<
  | { ok: true; order: Order }
  | { ok: false; error: string }
> {
  const state = getDemoState();
  const catalog = await getCatalog();

  if (!catalog.orderingOpen) {
    return { ok: false, error: "Today's Lunch Run ordering has closed." };
  }

  if (
    !catalog.settings.test_mode &&
    catalog.orderCount >= catalog.settings.max_daily_orders
  ) {
    return { ok: false, error: "Today's Lunch Run is full." };
  }

  const merchMax = roundMoney(
    input.items.reduce(
      (sum, i) => sum + i.maxPrice * i.quantity,
      0,
    ),
  );
  if (merchMax < catalog.settings.min_merchandise) {
    return {
      ok: false,
      error: `Minimum merchandise order is $${catalog.settings.min_merchandise.toFixed(2)}.`,
    };
  }
  if (merchMax > catalog.settings.max_merchandise) {
    return {
      ok: false,
      error: `Maximum merchandise authorization is $${catalog.settings.max_merchandise.toFixed(2)}.`,
    };
  }

  const totalItems = input.items.reduce((sum, i) => sum + i.quantity, 0);
  if (totalItems > catalog.settings.max_items_per_order) {
    return {
      ok: false,
      error: `Maximum ${catalog.settings.max_items_per_order} items per order.`,
    };
  }

  const order = createDemoOrder({
    customerName: sanitizeText(input.customerName, 60),
    deliveryLocation: sanitizeText(input.deliveryLocation, 80),
    deliveryLocationOther: input.deliveryLocationOther
      ? sanitizeText(input.deliveryLocationOther, 120)
      : null,
    paymentMethod: sanitizeText(input.paymentMethod, 40),
    notes: input.notes ? sanitizeText(input.notes, 400) : null,
    tipAmount: input.tipAmount ?? 0,
    items: input.items.map((i) => ({
      product_id: i.productId,
      is_custom: i.isCustom,
      product_name: sanitizeText(i.name, 120),
      brand: i.brand ? sanitizeText(i.brand, 80) : null,
      size: i.size ? sanitizeText(i.size, 40) : null,
      flavor: i.flavor ? sanitizeText(i.flavor, 60) : null,
      description: i.description ? sanitizeText(i.description, 300) : null,
      quantity: i.quantity,
      estimated_price: i.estimatedPrice,
      min_estimated: i.minEstimated,
      max_estimated: i.maxEstimated,
      max_price: i.maxPrice,
      substitution: i.substitution,
      image_url: i.imageUrl ?? null,
    })),
  });

  return { ok: true, order };
}

export async function getAdminDashboard() {
  const state = getDemoState();
  const orders = state.orders.filter((o) => o.session_id === state.session.id);
  const active = orders.filter((o) => o.status !== "cancelled");
  const fee = getActiveServiceFee(state);
  const paid = active.filter((o) => o.payment_status === "paid" || o.payment_status === "partially_paid");
  const unpaid = active.filter((o) => o.payment_status === "unpaid");
  const delivered = active.filter((o) => o.status === "delivered");
  const shoppingTotal = roundMoney(
    active.reduce((sum, o) => {
      if (o.merchandise_actual != null) return sum + o.merchandise_actual;
      return sum + o.merchandise_estimate_max;
    }, 0),
  );
  const feeRevenue = roundMoney(active.length * fee);
  const staleProducts = state.products.filter((p) => {
    if (!p.last_price_update) return true;
    const hours =
      (Date.now() - new Date(p.last_price_update).getTime()) / (1000 * 60 * 60);
    return hours > 72;
  });

  const topItems = new Map<string, number>();
  for (const o of active) {
    for (const item of o.items ?? []) {
      topItems.set(item.product_name, (topItems.get(item.product_name) ?? 0) + item.quantity);
    }
  }

  return {
    demo: isDemoMode(),
    session: state.session,
    settings: state.settings,
    stores: state.stores,
    metrics: {
      todaysOrders: active.length,
      shoppingTotal,
      lunchRunFees: feeRevenue,
      expectedRevenue: feeRevenue,
      paidOrders: paid.length,
      pendingPayments: unpaid.length,
      delivered: delivered.length,
      remaining: active.length - delivered.length,
      stalePrices: staleProducts.length,
    },
    recentOrders: active.slice(0, 10),
    topItems: Array.from(topItems.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8),
    statusBreakdown: {
      delivered: delivered.length,
      ready: active.filter((o) => o.status === "ready").length,
      shopping: active.filter((o) =>
        ["shopping", "shopping_soon", "purchased", "returning"].includes(o.status),
      ).length,
      unpaid: unpaid.length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      received: active.filter((o) => o.status === "received").length,
    },
  };
}

export async function getOrders(filter?: string, search?: string): Promise<Order[]> {
  const state = getDemoState();
  let orders = [...state.orders];

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.order_code.toLowerCase().includes(q),
    );
  }

  if (filter && filter !== "all") {
    orders = orders.filter((o) => {
      switch (filter) {
        case "paid":
          return o.payment_status === "paid";
        case "unpaid":
          return o.payment_status === "unpaid";
        case "shopping":
          return ["shopping", "shopping_soon"].includes(o.status);
        case "purchased":
          return o.status === "purchased";
        case "ready":
          return o.status === "ready";
        case "delivered":
          return o.status === "delivered";
        case "cancelled":
          return o.status === "cancelled";
        default:
          return true;
      }
    });
  }

  return orders;
}

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  return buildShoppingList();
}

export async function updateShelfPrice(productKey: string, price: number) {
  return distributeShelfPrice(productKey, price, { markFound: true });
}

export async function setItemUnavailable(productKey: string) {
  markItemUnavailable(productKey);
}

export async function applySubstitution(input: {
  orderItemId: string;
  replacementName: string;
  replacementPrice: number;
}) {
  return recordSubstitution(input);
}

export async function updateOrderPayment(
  orderId: string,
  amountPaid: number,
  paymentStatus?: Order["payment_status"],
) {
  const state = getDemoState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.amount_paid = amountPaid;
  if (paymentStatus) order.payment_status = paymentStatus;
  else if (order.final_total != null) {
    if (amountPaid <= 0) order.payment_status = "unpaid";
    else if (amountPaid + 0.001 >= order.final_total) order.payment_status = "paid";
    else order.payment_status = "partially_paid";
  } else if (amountPaid > 0) {
    order.payment_status = "paid";
  }
  recalculateOrderTotals(order);
  return order;
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const state = getDemoState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  if (status === "delivered") {
    order.delivered_at = new Date().toISOString();
  }
  order.updated_at = new Date().toISOString();
  return order;
}

export async function markDelivered(orderId: string) {
  return updateOrderStatus(orderId, "delivered");
}

export async function markNotFound(orderId: string) {
  const state = getDemoState();
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = "ready";
  order.updated_at = new Date().toISOString();
  return order;
}

export async function getProducts(): Promise<Product[]> {
  return getDemoState().products.filter((p) => !p.archived);
}

export async function getCategories(): Promise<Category[]> {
  return getDemoState().categories.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getSettings(): Promise<AppSettings> {
  return { ...getDemoState().settings };
}

export async function saveSettings(settings: AppSettings) {
  const state = getDemoState();
  state.settings = { ...settings };
  if (settings.active_store_id) {
    state.session.store_id = settings.active_store_id;
  }
  state.session.cutoff_time = settings.default_cutoff;
  state.session.max_orders = settings.max_daily_orders;
  if (settings.test_mode) {
    state.session.status = "open";
  }
  return state.settings;
}

export async function setTestMode(enabled: boolean) {
  const state = getDemoState();
  state.settings = { ...state.settings, test_mode: enabled };
  if (enabled) {
    state.session.status = "open";
  }
  return state.settings;
}

export async function updateSessionStatus(status: LunchRunSession["status"]) {
  const state = getDemoState();
  state.session.status = status;
  return state.session;
}

export async function reopenOrders() {
  const state = getDemoState();
  state.session.status = "open";
  return state.session;
}

export async function upsertProduct(product: Partial<Product> & { name: string; category_id: string }) {
  const state = getDemoState();
  if (product.id) {
    const idx = state.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      state.products[idx] = {
        ...state.products[idx],
        ...product,
        updated_at: new Date().toISOString(),
      };
      return state.products[idx];
    }
  }
  const created: Product = {
    id: `p-${Date.now()}`,
    brand: null,
    description: null,
    size: null,
    flavor: null,
    image_url: null,
    store_id: state.settings.active_store_id,
    current_price: null,
    min_price: null,
    max_price: null,
    popularity: 50,
    available: true,
    active: true,
    archived: false,
    last_price_update: null,
    external_product_url: null,
    external_product_id: null,
    max_quantity: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...product,
  };
  state.products.push(created);
  return created;
}

export async function archiveProduct(id: string) {
  const state = getDemoState();
  const p = state.products.find((x) => x.id === id);
  if (p) {
    p.archived = true;
    p.active = false;
  }
  return p;
}

export async function importPrices(items: PriceImportItem[], source = "api") {
  const state = getDemoState();
  let successful = 0;
  let failed = 0;
  let newProducts = 0;
  const warnings: string[] = [];

  for (const item of items) {
    try {
      let product =
        (item.externalId &&
          state.products.find((p) => p.external_product_id === item.externalId)) ||
        (item.productUrl &&
          state.products.find((p) => p.external_product_url === item.productUrl)) ||
        state.products.find(
          (p) =>
            normalizeProductKey(p.brand, p.name, p.size) ===
            normalizeProductKey(item.brand ?? null, item.name, item.size ?? null),
        );

      if (!product) {
        state.pendingMatches.push({
          id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          external_id: item.externalId ?? null,
          name: item.name,
          brand: item.brand ?? null,
          size: item.size ?? null,
          price: item.price,
          product_url: item.productUrl ?? null,
          image_url: item.imageUrl ?? null,
          store: item.store ?? null,
          match_status: "pending_review",
          matched_product_id: null,
          created_at: new Date().toISOString(),
        });
        newProducts++;
        warnings.push(`Needs review: ${item.name}`);
        continue;
      }

      const oldPrice = product.current_price;
      if (oldPrice != null && Math.abs(oldPrice - item.price) / oldPrice > 0.25) {
        warnings.push(`Major price change for ${product.name}: ${oldPrice} → ${item.price}`);
      }

      state.priceHistory.push({
        id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        product_id: product.id,
        old_price: oldPrice,
        new_price: item.price,
        store_id: product.store_id,
        source,
        created_at: new Date().toISOString(),
      });

      product.current_price = item.price;
      product.last_price_update = item.lastChecked ?? new Date().toISOString();
      if (item.availability != null) product.available = item.availability;
      if (item.imageUrl) product.image_url = item.imageUrl;
      if (item.productUrl) product.external_product_url = item.productUrl;
      if (item.externalId) product.external_product_id = item.externalId;
      product.updated_at = new Date().toISOString();
      successful++;
    } catch {
      failed++;
    }
  }

  const log = {
    id: `il-${Date.now()}`,
    source,
    timestamp: new Date().toISOString(),
    total_products: items.length,
    successful_updates: successful,
    failed_updates: failed,
    new_products: newProducts,
    warnings,
  };
  state.importLogs.unshift(log);
  return log;
}

export async function getPriceData() {
  const state = getDemoState();
  return {
    products: state.products.filter((p) => !p.archived),
    history: state.priceHistory,
    pending: state.pendingMatches.filter((p) => p.match_status === "pending_review"),
    logs: state.importLogs,
  };
}

export async function getRevenueSummary() {
  const state = getDemoState();
  const orders = state.orders.filter((o) => o.status !== "cancelled");
  const merchandise = roundMoney(
    orders.reduce((sum, o) => sum + (o.merchandise_actual ?? o.merchandise_estimate_max), 0),
  );
  const fees = roundMoney(orders.reduce((sum, o) => sum + o.service_fee, 0));
  const collected = roundMoney(orders.reduce((sum, o) => sum + o.amount_paid, 0));
  const refunds = 0;

  const byDay = new Map<string, { fees: number; orders: number }>();
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    const cur = byDay.get(day) ?? { fees: 0, orders: 0 };
    cur.fees += o.service_fee;
    cur.orders += 1;
    byDay.set(day, cur);
  }

  const topProducts = new Map<string, number>();
  const topCategories = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items ?? []) {
      topProducts.set(item.product_name, (topProducts.get(item.product_name) ?? 0) + item.quantity);
      const product = state.products.find((p) => p.id === item.product_id);
      const cat = state.categories.find((c) => c.id === product?.category_id);
      if (cat) topCategories.set(cat.name, (topCategories.get(cat.name) ?? 0) + item.quantity);
    }
  }

  return {
    collected,
    merchandise,
    fees,
    refunds,
    grossServiceRevenue: fees - refunds,
    averageOrder: orders.length ? roundMoney(collected / orders.length || (merchandise + fees) / orders.length) : 0,
    orderCount: orders.length,
    itemCount: orders.reduce(
      (sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0),
      0,
    ),
    skipped: orders.reduce(
      (sum, o) => sum + (o.items?.filter((i) => i.status === "skipped" || i.status === "unavailable").length ?? 0),
      0,
    ),
    substitutions: orders.reduce(
      (sum, o) => sum + (o.items?.filter((i) => i.status === "substituted").length ?? 0),
      0,
    ),
    mostPopularItem:
      Array.from(topProducts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
    mostPopularCategory:
      Array.from(topCategories.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
    daily: Array.from(byDay.entries())
      .map(([date, v]) => ({ date, ...v, fees: roundMoney(v.fees) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    topProducts: Array.from(topProducts.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10),
  };
}

export async function updateCategoryOrder(orderedIds: string[]) {
  const state = getDemoState();
  orderedIds.forEach((id, idx) => {
    const cat = state.categories.find((c) => c.id === id);
    if (cat) cat.shopping_order = idx + 1;
  });
  return state.categories;
}

export async function allocateReceiptTax(totalTax: number) {
  const state = getDemoState();
  const orders = state.orders.filter((o) => o.status !== "cancelled");
  const merchandiseTotal = orders.reduce((sum, o) => {
    const m =
      o.items
        ?.filter((i) => i.status === "found" || i.status === "substituted")
        .reduce((s, i) => {
          const unit =
            i.status === "substituted"
              ? (i.replacement_price ?? i.actual_price ?? 0)
              : (i.actual_price ?? 0);
          return s + unit * i.quantity;
        }, 0) ?? 0;
    return sum + m;
  }, 0);

  if (merchandiseTotal <= 0) return;

  for (const order of orders) {
    const merch =
      order.items
        ?.filter((i) => i.status === "found" || i.status === "substituted")
        .reduce((s, i) => {
          const unit =
            i.status === "substituted"
              ? (i.replacement_price ?? i.actual_price ?? 0)
              : (i.actual_price ?? 0);
          return s + unit * i.quantity;
        }, 0) ?? 0;
    const share = roundMoney((merch / merchandiseTotal) * totalTax);
    order.tax_amount = share;
    if (order.items) {
      for (const item of order.items) {
        item.tax_amount = 0;
      }
    }
    recalculateOrderTotals(order, { ...state.settings, tax_mode: "receipt" });
  }
}

export async function demoAdminLogin(email: string, password: string) {
  const state = getDemoState();
  if (
    (email === "admin@lunchrun.local" && password === "lunchrun") ||
    (isDemoMode() && password.length >= 4)
  ) {
    state.adminLoggedIn = true;
    return { ok: true as const };
  }
  return { ok: false as const, error: "Invalid credentials" };
}

export async function demoAdminLogout() {
  getDemoState().adminLoggedIn = false;
}

export async function isAdminAuthenticated() {
  if (!isDemoMode()) {
    // Supabase path handled in middleware/actions
    return false;
  }
  return getDemoState().adminLoggedIn;
}

export async function togglePickedUp(productKey: string, picked: boolean) {
  const state = getDemoState();
  const list = buildShoppingList();
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return;
  for (const c of group.customers) {
    const order = state.orders.find((o) => o.id === c.orderId);
    const item = order?.items?.find((i) => i.id === c.orderItemId);
    if (item) {
      item.picked_up = picked;
      if (picked && item.actual_price != null && item.status === "pending") {
        item.status = "found";
      }
    }
  }
}

export async function finishShopping() {
  const state = getDemoState();
  state.session.status = "returning";
  for (const order of state.orders) {
    if (["received", "shopping_soon", "shopping"].includes(order.status)) {
      order.status = "purchased";
      recalculateOrderTotals(order);
    }
  }
  return state.session;
}
