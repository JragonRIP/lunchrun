import { effectiveServiceFee } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/admin";
import type {
  AppSettings,
  Category,
  LunchRunSession,
  Order,
  OrderItem,
  PendingProductMatch,
  PriceHistoryEntry,
  PriceImportItem,
  PriceImportLog,
  Product,
  ProductWithCategory,
  ShoppingListItem,
  Store,
  TaxMode,
} from "@/lib/types";
import {
  generateOrderCode,
  generateTrackingToken,
  normalizeProductKey,
  parseTimeToToday,
  roundMoney,
  sanitizeText,
} from "@/lib/utils";
import type { CheckoutInput } from "@/lib/validation/schemas";
import type { SupabaseClient } from "@supabase/supabase-js";

type Db = SupabaseClient;

function num(v: unknown, fallback = 0): number {
  if (v == null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapStore(row: Record<string, unknown>): Store {
  return {
    id: String(row.id),
    name: String(row.name),
    address: (row.address as string | null) ?? null,
    active: Boolean(row.active),
    is_default: Boolean(row.is_default),
    price_source: (row.price_source as string | null) ?? null,
    external_location_id: (row.external_location_id as string | null) ?? null,
    hours: (row.hours as string | null) ?? null,
  };
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    icon: (row.icon as string | null) ?? null,
    sort_order: num(row.sort_order),
    shopping_order: num(row.shopping_order),
    active: Boolean(row.active),
  };
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    brand: (row.brand as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    size: (row.size as string | null) ?? null,
    flavor: (row.flavor as string | null) ?? null,
    category_id: String(row.category_id),
    image_url: (row.image_url as string | null) ?? null,
    store_id: (row.store_id as string | null) ?? null,
    current_price: numOrNull(row.current_price),
    min_price: numOrNull(row.min_price),
    max_price: numOrNull(row.max_price),
    popularity: num(row.popularity, 50),
    available: Boolean(row.available),
    active: Boolean(row.active),
    archived: Boolean(row.archived),
    last_price_update: (row.last_price_update as string | null) ?? null,
    external_product_url: (row.external_product_url as string | null) ?? null,
    external_product_id: (row.external_product_id as string | null) ?? null,
    max_quantity: row.max_quantity == null ? null : num(row.max_quantity),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function mapSettings(row: Record<string, unknown>): AppSettings {
  const locations = row.delivery_locations;
  const methods = row.payment_methods;
  return {
    service_fee: num(row.service_fee, 1.5),
    min_merchandise: num(row.min_merchandise, 3),
    max_merchandise: num(row.max_merchandise, 20),
    max_items_per_order: num(row.max_items_per_order, 8),
    max_daily_orders: num(row.max_daily_orders, 20),
    default_cutoff: String(row.default_cutoff ?? "11:30"),
    default_delivery_window: String(row.default_delivery_window ?? "Lunch period"),
    tax_mode: (row.tax_mode as TaxMode) ?? "simple",
    tax_rate: num(row.tax_rate, 0.0825),
    active_store_id: (row.active_store_id as string | null) ?? null,
    delivery_locations: Array.isArray(locations)
      ? (locations as string[])
      : ["Cafeteria", "Commons", "Hallway", "Outside cafeteria", "Other"],
    payment_methods: Array.isArray(methods) ? (methods as string[]) : ["Cash Prepay"],
    allow_custom_requests: Boolean(row.allow_custom_requests ?? true),
    allow_substitutions: Boolean(row.allow_substitutions ?? true),
    promo_fee: numOrNull(row.promo_fee),
    promo_label: (row.promo_label as string | null) ?? null,
    promo_active: Boolean(row.promo_active),
  };
}

function mapSession(row: Record<string, unknown>): LunchRunSession {
  return {
    id: String(row.id),
    date: String(row.date).slice(0, 10),
    store_id: String(row.store_id),
    open_time: String(row.open_time ?? "07:00"),
    cutoff_time: String(row.cutoff_time ?? "11:30"),
    delivery_window: (row.delivery_window as string | null) ?? null,
    status: row.status as LunchRunSession["status"],
    max_orders: num(row.max_orders, 20),
    created_at: String(row.created_at),
  };
}

function mapOrderItem(row: Record<string, unknown>): OrderItem {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    product_id: (row.product_id as string | null) ?? null,
    is_custom: Boolean(row.is_custom),
    product_name: String(row.product_name),
    brand: (row.brand as string | null) ?? null,
    size: (row.size as string | null) ?? null,
    flavor: (row.flavor as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    quantity: num(row.quantity, 1),
    estimated_price: numOrNull(row.estimated_price),
    min_estimated: numOrNull(row.min_estimated),
    max_estimated: numOrNull(row.max_estimated),
    max_price: num(row.max_price),
    actual_price: numOrNull(row.actual_price),
    tax_amount: num(row.tax_amount),
    substitution: (row.substitution as OrderItem["substitution"]) ?? "closest_under_max",
    substitution_notes: (row.substitution_notes as string | null) ?? null,
    status: (row.status as OrderItem["status"]) ?? "pending",
    replacement_name: (row.replacement_name as string | null) ?? null,
    replacement_price: numOrNull(row.replacement_price),
    picked_up: Boolean(row.picked_up),
    image_url: (row.image_url as string | null) ?? null,
  };
}

function mapOrder(row: Record<string, unknown>): Order {
  const rawItems = row.order_items;
  const items = Array.isArray(rawItems)
    ? (rawItems as Record<string, unknown>[]).map(mapOrderItem)
    : undefined;
  return {
    id: String(row.id),
    order_code: String(row.order_code),
    tracking_token: String(row.tracking_token),
    session_id: String(row.session_id),
    customer_name: String(row.customer_name),
    delivery_location: String(row.delivery_location),
    delivery_location_other: (row.delivery_location_other as string | null) ?? null,
    payment_method: String(row.payment_method),
    notes: (row.notes as string | null) ?? null,
    tip_amount: num(row.tip_amount),
    status: row.status as Order["status"],
    payment_status: row.payment_status as Order["payment_status"],
    merchandise_estimate_min: num(row.merchandise_estimate_min),
    merchandise_estimate_max: num(row.merchandise_estimate_max),
    merchandise_actual: numOrNull(row.merchandise_actual),
    tax_amount: num(row.tax_amount),
    service_fee: num(row.service_fee),
    estimated_total_min: num(row.estimated_total_min),
    estimated_total_max: num(row.estimated_total_max),
    final_total: numOrNull(row.final_total),
    max_authorized_total: num(row.max_authorized_total),
    amount_paid: num(row.amount_paid),
    change_owed: num(row.change_owed),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    delivered_at: (row.delivered_at as string | null) ?? null,
    items,
  };
}

function mapPriceHistory(row: Record<string, unknown>): PriceHistoryEntry {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    old_price: numOrNull(row.old_price),
    new_price: num(row.new_price),
    store_id: (row.store_id as string | null) ?? null,
    source: String(row.source ?? "manual"),
    created_at: String(row.created_at),
  };
}

function mapPendingMatch(row: Record<string, unknown>): PendingProductMatch {
  return {
    id: String(row.id),
    external_id: (row.external_id as string | null) ?? null,
    name: String(row.name),
    brand: (row.brand as string | null) ?? null,
    size: (row.size as string | null) ?? null,
    price: numOrNull(row.price),
    product_url: (row.product_url as string | null) ?? null,
    image_url: (row.image_url as string | null) ?? null,
    store: (row.store as string | null) ?? null,
    match_status: (row.match_status as PendingProductMatch["match_status"]) ?? "pending_review",
    matched_product_id: (row.matched_product_id as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

function mapImportLog(row: Record<string, unknown>): PriceImportLog {
  const warnings = row.warnings;
  return {
    id: String(row.id),
    source: String(row.source),
    timestamp: String(row.timestamp),
    total_products: num(row.total_products),
    successful_updates: num(row.successful_updates),
    failed_updates: num(row.failed_updates),
    new_products: num(row.new_products),
    warnings: Array.isArray(warnings) ? (warnings as string[]) : [],
  };
}

function recalculateOrderTotals(order: Order, settings: AppSettings): Order {
  const items = order.items ?? [];
  const purchased = items.filter(
    (i) => i.status === "found" || i.status === "substituted",
  );

  let merchandise = 0;
  for (const item of purchased) {
    const unit =
      item.status === "substituted"
        ? (item.replacement_price ?? item.actual_price ?? 0)
        : (item.actual_price ?? 0);
    merchandise += unit * item.quantity;
  }
  merchandise = roundMoney(merchandise);

  let tax = 0;
  if (settings.tax_mode === "simple" && settings.tax_rate > 0) {
    tax = roundMoney(merchandise * settings.tax_rate);
  } else {
    tax = roundMoney(items.reduce((sum, i) => sum + i.tax_amount, 0));
  }

  const finalTotal = roundMoney(
    merchandise + tax + order.service_fee + order.tip_amount,
  );
  order.merchandise_actual = merchandise;
  order.tax_amount = tax;
  order.final_total = finalTotal;
  order.change_owed = roundMoney(Math.max(0, order.amount_paid - finalTotal));
  order.updated_at = new Date().toISOString();
  return order;
}

async function persistOrderTotals(db: Db, order: Order) {
  const { error } = await db
    .from("orders")
    .update({
      merchandise_actual: order.merchandise_actual,
      tax_amount: order.tax_amount,
      final_total: order.final_total,
      change_owed: order.change_owed,
      amount_paid: order.amount_paid,
      payment_status: order.payment_status,
      updated_at: order.updated_at,
    })
    .eq("id", order.id);
  if (error) throw error;
}

async function fetchSettings(db: Db): Promise<AppSettings> {
  const { data, error } = await db.from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return mapSettings(data as Record<string, unknown>);
}

async function getOrCreateTodaySession(db: Db): Promise<LunchRunSession> {
  const today = todayIsoDate();
  const { data: existing, error: findError } = await db
    .from("lunch_run_sessions")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) return mapSession(existing as Record<string, unknown>);

  const settings = await fetchSettings(db);
  const storeId = settings.active_store_id;
  if (!storeId) throw new Error("No active store configured in settings");

  const { data: created, error } = await db
    .from("lunch_run_sessions")
    .insert({
      date: today,
      store_id: storeId,
      open_time: "07:00",
      cutoff_time: settings.default_cutoff,
      delivery_window: settings.default_delivery_window,
      status: "open",
      max_orders: settings.max_daily_orders,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapSession(created as Record<string, unknown>);
}

async function nextOrderCode(db: Db): Promise<string> {
  const { data, error } = await db
    .from("orders")
    .select("order_code")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  let max = 1049;
  for (const row of data ?? []) {
    const match = /^LR-(\d+)$/i.exec(String((row as { order_code: string }).order_code));
    if (match) {
      max = Math.max(max, parseInt(match[1], 10));
    }
  }
  return generateOrderCode(max + 1);
}

async function fetchOrderWithItems(db: Db, orderId: string): Promise<Order | null> {
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapOrder(data as Record<string, unknown>);
}

async function fetchSessionOrders(db: Db, sessionId: string): Promise<Order[]> {
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapOrder(row as Record<string, unknown>));
}

function buildShoppingListFrom(
  orders: Order[],
  products: Product[],
  categories: Category[],
): ShoppingListItem[] {
  const list = orders.filter((o) => o.status !== "cancelled");
  const map = new Map<string, ShoppingListItem>();
  const otherCat = categories.find((c) => c.slug === "other");

  for (const order of list) {
    for (const item of order.items ?? []) {
      if (item.status === "skipped" || item.status === "unavailable") continue;
      const key =
        item.product_id ??
        normalizeProductKey(item.brand, item.product_name, item.size);
      const product = item.product_id
        ? products.find((p) => p.id === item.product_id)
        : undefined;
      const category = product
        ? categories.find((c) => c.id === product.category_id)
        : otherCat;

      const customer = {
        orderId: order.id,
        orderItemId: item.id,
        customerName: order.customer_name,
        quantity: item.quantity,
        maxPrice: item.max_price,
        substitution: item.substitution,
      };

      const existing = map.get(key);
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

export function isOrderingOpen(
  session: LunchRunSession,
  settings: AppSettings,
  orderCount: number,
): boolean {
  if (session.status === "cancelled" || session.status === "completed") return false;
  if (session.status !== "open" && session.status !== "scheduled") return false;
  if (orderCount >= (session.max_orders || settings.max_daily_orders)) return false;
  const cutoff = parseTimeToToday(session.cutoff_time || settings.default_cutoff);
  return Date.now() < cutoff.getTime();
}

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
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);

  const [
    { data: categoryRows, error: catErr },
    { data: productRows, error: prodErr },
    { data: storeRows, error: storeErr },
    { count, error: countErr },
  ] = await Promise.all([
    db.from("categories").select("*").eq("active", true).order("sort_order"),
    db.from("products").select("*").eq("active", true).eq("archived", false),
    db.from("stores").select("*").eq("active", true),
    db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id)
      .neq("status", "cancelled"),
  ]);

  if (catErr) throw catErr;
  if (prodErr) throw prodErr;
  if (storeErr) throw storeErr;
  if (countErr) throw countErr;

  const categories = (categoryRows ?? []).map((r) => mapCategory(r as Record<string, unknown>));
  const stores = (storeRows ?? []).map((r) => mapStore(r as Record<string, unknown>));
  const products: ProductWithCategory[] = (productRows ?? [])
    .map((r) => {
      const p = mapProduct(r as Record<string, unknown>);
      return {
        ...p,
        category: categories.find((c) => c.id === p.category_id),
        store: stores.find((s) => s.id === p.store_id) ?? null,
      };
    })
    .sort((a, b) => b.popularity - a.popularity);

  const store =
    stores.find((s) => s.id === session.store_id) ??
    stores.find((s) => s.is_default) ??
    null;

  const orderCount = count ?? 0;
  const orderingOpen = isOrderingOpen(session, settings, orderCount);

  return {
    products,
    categories,
    stores,
    session,
    settings,
    store,
    orderingOpen,
    orderCount,
    demo: false,
  };
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .eq("tracking_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapOrder(data as Record<string, unknown>);
}

export async function findOrderByCodeAndName(
  code: string,
  name: string,
): Promise<Order | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(*)")
    .ilike("order_code", code.trim())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const order = mapOrder(data as Record<string, unknown>);
  if (order.customer_name.toLowerCase() !== name.trim().toLowerCase()) return null;
  return order;
}

export async function submitOrder(input: CheckoutInput): Promise<
  | { ok: true; order: Order }
  | { ok: false; error: string }
> {
  const catalog = await getCatalog();

  if (!catalog.orderingOpen) {
    return { ok: false, error: "Today's Lunch Run ordering has closed." };
  }

  if (catalog.orderCount >= catalog.settings.max_daily_orders) {
    return { ok: false, error: "Today's Lunch Run is full." };
  }

  const merchMax = roundMoney(
    input.items.reduce((sum, i) => sum + i.maxPrice * i.quantity, 0),
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

  const db = createServiceClient();
  const fee = effectiveServiceFee(catalog.settings);
  const tipAmount = input.tipAmount ?? 0;
  const orderCode = await nextOrderCode(db);
  const trackingToken = generateTrackingToken();

  const merchMin = roundMoney(
    input.items.reduce(
      (sum, i) => sum + (i.minEstimated ?? i.estimatedPrice ?? 0) * i.quantity,
      0,
    ),
  );
  const merchEstMax = roundMoney(
    input.items.reduce(
      (sum, i) =>
        sum + (i.maxEstimated ?? i.estimatedPrice ?? i.maxPrice) * i.quantity,
      0,
    ),
  );
  const maxAuth = roundMoney(merchMax + fee + tipAmount);

  const { data: orderRow, error: orderErr } = await db
    .from("orders")
    .insert({
      order_code: orderCode,
      tracking_token: trackingToken,
      session_id: catalog.session.id,
      customer_name: sanitizeText(input.customerName, 60),
      delivery_location: sanitizeText(input.deliveryLocation, 80),
      delivery_location_other: input.deliveryLocationOther
        ? sanitizeText(input.deliveryLocationOther, 120)
        : null,
      payment_method: sanitizeText(input.paymentMethod, 40),
      notes: input.notes ? sanitizeText(input.notes, 400) : null,
      tip_amount: tipAmount,
      status: "received",
      payment_status: "unpaid",
      merchandise_estimate_min: merchMin,
      merchandise_estimate_max: merchEstMax,
      merchandise_actual: null,
      tax_amount: 0,
      service_fee: fee,
      estimated_total_min: roundMoney(merchMin + fee + tipAmount),
      estimated_total_max: roundMoney(merchEstMax + fee + tipAmount),
      final_total: null,
      max_authorized_total: maxAuth,
      amount_paid: 0,
      change_owed: 0,
    })
    .select("*")
    .single();

  if (orderErr || !orderRow) {
    return { ok: false, error: orderErr?.message ?? "Failed to create order." };
  }

  const orderId = String((orderRow as { id: string }).id);
  const itemRows = input.items.map((i) => ({
    order_id: orderId,
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
    actual_price: null,
    tax_amount: 0,
    substitution: i.substitution,
    substitution_notes: null,
    status: "pending",
    replacement_name: null,
    replacement_price: null,
    picked_up: false,
    image_url: i.imageUrl ?? null,
  }));

  const { error: itemsErr } = await db.from("order_items").insert(itemRows);
  if (itemsErr) {
    await db.from("orders").delete().eq("id", orderId);
    return { ok: false, error: itemsErr.message };
  }

  const order = await fetchOrderWithItems(db, orderId);
  if (!order) return { ok: false, error: "Order created but could not be reloaded." };
  return { ok: true, order };
}

export async function getAdminDashboard() {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);
  const fee = effectiveServiceFee(settings);

  const [
    { data: storeRows },
    { data: productRows },
    orders,
  ] = await Promise.all([
    db.from("stores").select("*"),
    db.from("products").select("*").eq("archived", false),
    fetchSessionOrders(db, session.id),
  ]);

  const stores = (storeRows ?? []).map((r) => mapStore(r as Record<string, unknown>));
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const active = orders.filter((o) => o.status !== "cancelled");
  const paid = active.filter(
    (o) => o.payment_status === "paid" || o.payment_status === "partially_paid",
  );
  const unpaid = active.filter((o) => o.payment_status === "unpaid");
  const delivered = active.filter((o) => o.status === "delivered");
  const shoppingTotal = roundMoney(
    active.reduce((sum, o) => {
      if (o.merchandise_actual != null) return sum + o.merchandise_actual;
      return sum + o.merchandise_estimate_max;
    }, 0),
  );
  const feeRevenue = roundMoney(active.length * fee);
  const staleProducts = products.filter((p) => {
    if (!p.last_price_update) return true;
    const hours =
      (Date.now() - new Date(p.last_price_update).getTime()) / (1000 * 60 * 60);
    return hours > 72;
  });

  const topItems = new Map<string, number>();
  for (const o of active) {
    for (const item of o.items ?? []) {
      topItems.set(
        item.product_name,
        (topItems.get(item.product_name) ?? 0) + item.quantity,
      );
    }
  }

  return {
    demo: false,
    session,
    settings,
    stores,
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
  const db = createServiceClient();
  const session = await getOrCreateTodaySession(db);
  let orders = await fetchSessionOrders(db, session.id);

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
  const db = createServiceClient();
  const session = await getOrCreateTodaySession(db);
  const [orders, { data: productRows }, { data: categoryRows }] = await Promise.all([
    fetchSessionOrders(db, session.id),
    db.from("products").select("*"),
    db.from("categories").select("*"),
  ]);
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoryRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>),
  );
  return buildShoppingListFrom(orders, products, categories);
}

export async function updateShelfPrice(productKey: string, price: number) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);
  const [orders, { data: productRows }, { data: categoryRows }] = await Promise.all([
    fetchSessionOrders(db, session.id),
    db.from("products").select("*"),
    db.from("categories").select("*"),
  ]);
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoryRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>),
  );
  const list = buildShoppingListFrom(orders, products, categories);
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return { warnings: ["Item not found"] as string[] };

  const warnings: string[] = [];
  const touchedOrderIds = new Set<string>();

  for (const customer of group.customers) {
    const order = orders.find((o) => o.id === customer.orderId);
    const item = order?.items?.find((i) => i.id === customer.orderItemId);
    if (!order || !item) continue;

    if (price > item.max_price) {
      warnings.push(
        `${customer.customerName}: shelf ${price} exceeds max ${item.max_price}`,
      );
      continue;
    }

    item.actual_price = price;
    item.picked_up = true;
    item.status = "found";

    const { error } = await db
      .from("order_items")
      .update({
        actual_price: price,
        picked_up: true,
        status: "found",
      })
      .eq("id", item.id);
    if (error) throw error;

    recalculateOrderTotals(order, settings);
    touchedOrderIds.add(order.id);
  }

  for (const orderId of touchedOrderIds) {
    const order = orders.find((o) => o.id === orderId);
    if (order) await persistOrderTotals(db, order);
  }

  return { warnings };
}

export async function setItemUnavailable(productKey: string) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);
  const [orders, { data: productRows }, { data: categoryRows }] = await Promise.all([
    fetchSessionOrders(db, session.id),
    db.from("products").select("*"),
    db.from("categories").select("*"),
  ]);
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoryRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>),
  );
  const list = buildShoppingListFrom(orders, products, categories);
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return;

  const touchedOrderIds = new Set<string>();
  for (const customer of group.customers) {
    const order = orders.find((o) => o.id === customer.orderId);
    const item = order?.items?.find((i) => i.id === customer.orderItemId);
    if (!item || !order) continue;
    item.status = "unavailable";
    item.picked_up = false;
    await db
      .from("order_items")
      .update({ status: "unavailable", picked_up: false })
      .eq("id", item.id);
    recalculateOrderTotals(order, settings);
    touchedOrderIds.add(order.id);
  }
  for (const orderId of touchedOrderIds) {
    const order = orders.find((o) => o.id === orderId);
    if (order) await persistOrderTotals(db, order);
  }
}

export async function applySubstitution(input: {
  orderItemId: string;
  replacementName: string;
  replacementPrice: number;
}) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const { data: itemRow, error } = await db
    .from("order_items")
    .select("*")
    .eq("id", input.orderItemId)
    .maybeSingle();
  if (error) throw error;
  if (!itemRow) return { ok: false as const, error: "Item not found" };

  const item = mapOrderItem(itemRow as Record<string, unknown>);
  if (input.replacementPrice > item.max_price) {
    return { ok: false as const, error: "Replacement exceeds customer maximum" };
  }

  await db
    .from("order_items")
    .update({
      replacement_name: input.replacementName,
      replacement_price: input.replacementPrice,
      actual_price: input.replacementPrice,
      status: "substituted",
      picked_up: true,
    })
    .eq("id", input.orderItemId);

  const order = await fetchOrderWithItems(db, item.order_id);
  if (!order) return { ok: false as const, error: "Order not found" };
  recalculateOrderTotals(order, settings);
  await persistOrderTotals(db, order);
  return { ok: true as const };
}

export async function updateOrderPayment(
  orderId: string,
  amountPaid: number,
  paymentStatus?: Order["payment_status"],
) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const order = await fetchOrderWithItems(db, orderId);
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

  recalculateOrderTotals(order, settings);
  await persistOrderTotals(db, order);
  return order;
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  const db = createServiceClient();
  const deliveredAt = status === "delivered" ? new Date().toISOString() : undefined;
  const updatedAt = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    updated_at: updatedAt,
  };
  if (deliveredAt) patch.delivered_at = deliveredAt;

  const { data, error } = await db
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select("*, order_items(*)")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapOrder(data as Record<string, unknown>);
}

export async function markDelivered(orderId: string) {
  return updateOrderStatus(orderId, "delivered");
}

export async function markNotFound(orderId: string) {
  return updateOrderStatus(orderId, "ready");
}

export async function getProducts(): Promise<Product[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("products")
    .select("*")
    .eq("archived", false)
    .order("name");
  if (error) throw error;
  return (data ?? []).map((r) => mapProduct(r as Record<string, unknown>));
}

export async function getCategories(): Promise<Category[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => mapCategory(r as Record<string, unknown>));
}

export async function getSettings(): Promise<AppSettings> {
  const db = createServiceClient();
  return fetchSettings(db);
}

export async function saveSettings(settings: AppSettings) {
  const db = createServiceClient();
  const { error } = await db
    .from("settings")
    .update({
      service_fee: settings.service_fee,
      min_merchandise: settings.min_merchandise,
      max_merchandise: settings.max_merchandise,
      max_items_per_order: settings.max_items_per_order,
      max_daily_orders: settings.max_daily_orders,
      default_cutoff: settings.default_cutoff,
      default_delivery_window: settings.default_delivery_window,
      tax_mode: settings.tax_mode,
      tax_rate: settings.tax_rate,
      active_store_id: settings.active_store_id,
      delivery_locations: settings.delivery_locations,
      payment_methods: settings.payment_methods,
      allow_custom_requests: settings.allow_custom_requests,
      allow_substitutions: settings.allow_substitutions,
      promo_fee: settings.promo_fee,
      promo_label: settings.promo_label,
      promo_active: settings.promo_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) throw error;

  const session = await getOrCreateTodaySession(db);
  const sessionPatch: Record<string, unknown> = {
    cutoff_time: settings.default_cutoff,
    max_orders: settings.max_daily_orders,
    delivery_window: settings.default_delivery_window,
  };
  if (settings.active_store_id) sessionPatch.store_id = settings.active_store_id;
  await db.from("lunch_run_sessions").update(sessionPatch).eq("id", session.id);

  return settings;
}

export async function updateSessionStatus(status: LunchRunSession["status"]) {
  const db = createServiceClient();
  const session = await getOrCreateTodaySession(db);
  const { data, error } = await db
    .from("lunch_run_sessions")
    .update({ status })
    .eq("id", session.id)
    .select("*")
    .single();
  if (error) throw error;
  return mapSession(data as Record<string, unknown>);
}

export async function reopenOrders() {
  return updateSessionStatus("open");
}

export async function upsertProduct(
  product: Partial<Product> & { name: string; category_id: string },
) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const now = new Date().toISOString();

  if (product.id) {
    const { data, error } = await db
      .from("products")
      .update({
        ...product,
        updated_at: now,
      })
      .eq("id", product.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (data) return mapProduct(data as Record<string, unknown>);
  }

  const { data, error } = await db
    .from("products")
    .insert({
      name: product.name,
      brand: product.brand ?? null,
      description: product.description ?? null,
      size: product.size ?? null,
      flavor: product.flavor ?? null,
      category_id: product.category_id,
      image_url: product.image_url ?? null,
      store_id: product.store_id ?? settings.active_store_id,
      current_price: product.current_price ?? null,
      min_price: product.min_price ?? null,
      max_price: product.max_price ?? null,
      popularity: product.popularity ?? 50,
      available: product.available ?? true,
      active: product.active ?? true,
      archived: false,
      last_price_update: product.last_price_update ?? null,
      external_product_url: product.external_product_url ?? null,
      external_product_id: product.external_product_id ?? null,
      max_quantity: product.max_quantity ?? null,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapProduct(data as Record<string, unknown>);
}

export async function archiveProduct(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from("products")
    .update({ archived: true, active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  return mapProduct(data as Record<string, unknown>);
}

export async function importPrices(items: PriceImportItem[], source = "api") {
  const db = createServiceClient();
  const { data: productRows, error: prodErr } = await db.from("products").select("*");
  if (prodErr) throw prodErr;
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));

  let successful = 0;
  let failed = 0;
  let newProducts = 0;
  const warnings: string[] = [];

  for (const item of items) {
    try {
      const product =
        (item.externalId &&
          products.find((p) => p.external_product_id === item.externalId)) ||
        (item.productUrl &&
          products.find((p) => p.external_product_url === item.productUrl)) ||
        products.find(
          (p) =>
            normalizeProductKey(p.brand, p.name, p.size) ===
            normalizeProductKey(item.brand ?? null, item.name, item.size ?? null),
        );

      if (!product) {
        await db.from("pending_product_matches").insert({
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
        });
        newProducts++;
        warnings.push(`Needs review: ${item.name}`);
        continue;
      }

      const oldPrice = product.current_price;
      if (oldPrice != null && Math.abs(oldPrice - item.price) / oldPrice > 0.25) {
        warnings.push(
          `Major price change for ${product.name}: ${oldPrice} → ${item.price}`,
        );
      }

      await db.from("price_history").insert({
        product_id: product.id,
        old_price: oldPrice,
        new_price: item.price,
        store_id: product.store_id,
        source,
      });

      const lastChecked = item.lastChecked ?? new Date().toISOString();
      const { error: updErr } = await db
        .from("products")
        .update({
          current_price: item.price,
          last_price_update: lastChecked,
          available: item.availability ?? product.available,
          image_url: item.imageUrl ?? product.image_url,
          external_product_url: item.productUrl ?? product.external_product_url,
          external_product_id: item.externalId ?? product.external_product_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);
      if (updErr) throw updErr;

      product.current_price = item.price;
      product.last_price_update = lastChecked;
      if (item.availability != null) product.available = item.availability;
      if (item.imageUrl) product.image_url = item.imageUrl;
      if (item.productUrl) product.external_product_url = item.productUrl;
      if (item.externalId) product.external_product_id = item.externalId;
      successful++;
    } catch {
      failed++;
    }
  }

  const { data: logRow, error: logErr } = await db
    .from("price_import_logs")
    .insert({
      source,
      total_products: items.length,
      successful_updates: successful,
      failed_updates: failed,
      new_products: newProducts,
      warnings,
    })
    .select("*")
    .single();
  if (logErr) throw logErr;
  return mapImportLog(logRow as Record<string, unknown>);
}

export async function getPriceData() {
  const db = createServiceClient();
  const [
    { data: productRows, error: pErr },
    { data: historyRows, error: hErr },
    { data: pendingRows, error: mErr },
    { data: logRows, error: lErr },
  ] = await Promise.all([
    db.from("products").select("*").eq("archived", false),
    db.from("price_history").select("*").order("created_at", { ascending: false }),
    db
      .from("pending_product_matches")
      .select("*")
      .eq("match_status", "pending_review")
      .order("created_at", { ascending: false }),
    db.from("price_import_logs").select("*").order("timestamp", { ascending: false }),
  ]);
  if (pErr) throw pErr;
  if (hErr) throw hErr;
  if (mErr) throw mErr;
  if (lErr) throw lErr;

  return {
    products: (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>)),
    history: (historyRows ?? []).map((r) => mapPriceHistory(r as Record<string, unknown>)),
    pending: (pendingRows ?? []).map((r) => mapPendingMatch(r as Record<string, unknown>)),
    logs: (logRows ?? []).map((r) => mapImportLog(r as Record<string, unknown>)),
  };
}

export async function getRevenueSummary() {
  const db = createServiceClient();
  const [
    { data: orderRows, error: oErr },
    { data: productRows, error: pErr },
    { data: categoryRows, error: cErr },
  ] = await Promise.all([
    db
      .from("orders")
      .select("*, order_items(*)")
      .neq("status", "cancelled")
      .order("created_at", { ascending: true }),
    db.from("products").select("*"),
    db.from("categories").select("*"),
  ]);
  if (oErr) throw oErr;
  if (pErr) throw pErr;
  if (cErr) throw cErr;

  const orders = (orderRows ?? []).map((r) => mapOrder(r as Record<string, unknown>));
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoryRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>),
  );

  const merchandise = roundMoney(
    orders.reduce(
      (sum, o) => sum + (o.merchandise_actual ?? o.merchandise_estimate_max),
      0,
    ),
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
      topProducts.set(
        item.product_name,
        (topProducts.get(item.product_name) ?? 0) + item.quantity,
      );
      const product = products.find((p) => p.id === item.product_id);
      const cat = categories.find((c) => c.id === product?.category_id);
      if (cat) {
        topCategories.set(cat.name, (topCategories.get(cat.name) ?? 0) + item.quantity);
      }
    }
  }

  return {
    collected,
    merchandise,
    fees,
    refunds,
    grossServiceRevenue: fees - refunds,
    averageOrder: orders.length
      ? roundMoney(
          collected / orders.length || (merchandise + fees) / orders.length,
        )
      : 0,
    orderCount: orders.length,
    itemCount: orders.reduce(
      (sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) ?? 0),
      0,
    ),
    skipped: orders.reduce(
      (sum, o) =>
        sum +
        (o.items?.filter((i) => i.status === "skipped" || i.status === "unavailable")
          .length ?? 0),
      0,
    ),
    substitutions: orders.reduce(
      (sum, o) =>
        sum + (o.items?.filter((i) => i.status === "substituted").length ?? 0),
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
  const db = createServiceClient();
  await Promise.all(
    orderedIds.map((id, idx) =>
      db.from("categories").update({ shopping_order: idx + 1 }).eq("id", id),
    ),
  );
  return getCategories();
}

export async function allocateReceiptTax(totalTax: number) {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);
  const orders = (await fetchSessionOrders(db, session.id)).filter(
    (o) => o.status !== "cancelled",
  );

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

  const receiptSettings: AppSettings = { ...settings, tax_mode: "receipt" };

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
      await db
        .from("order_items")
        .update({ tax_amount: 0 })
        .eq("order_id", order.id);
    }
    recalculateOrderTotals(order, receiptSettings);
    await persistOrderTotals(db, order);
  }
}

export async function demoAdminLogin(_email: string, _password: string) {
  throw new Error("demoAdminLogin is only available in demo mode");
}

export async function demoAdminLogout() {
  throw new Error("demoAdminLogout is only available in demo mode");
}

export async function isAdminAuthenticated() {
  return false;
}

export async function togglePickedUp(productKey: string, picked: boolean) {
  const db = createServiceClient();
  const session = await getOrCreateTodaySession(db);
  const [orders, { data: productRows }, { data: categoryRows }] = await Promise.all([
    fetchSessionOrders(db, session.id),
    db.from("products").select("*"),
    db.from("categories").select("*"),
  ]);
  const products = (productRows ?? []).map((r) => mapProduct(r as Record<string, unknown>));
  const categories = (categoryRows ?? []).map((r) =>
    mapCategory(r as Record<string, unknown>),
  );
  const list = buildShoppingListFrom(orders, products, categories);
  const group = list.find((i) => i.productKey === productKey);
  if (!group) return;

  for (const c of group.customers) {
    const order = orders.find((o) => o.id === c.orderId);
    const item = order?.items?.find((i) => i.id === c.orderItemId);
    if (!item) continue;
    item.picked_up = picked;
    const patch: Record<string, unknown> = { picked_up: picked };
    if (picked && item.actual_price != null && item.status === "pending") {
      item.status = "found";
      patch.status = "found";
    }
    await db.from("order_items").update(patch).eq("id", item.id);
  }
}

export async function finishShopping() {
  const db = createServiceClient();
  const settings = await fetchSettings(db);
  const session = await getOrCreateTodaySession(db);

  const { data: sessionRow, error: sessErr } = await db
    .from("lunch_run_sessions")
    .update({ status: "returning" })
    .eq("id", session.id)
    .select("*")
    .single();
  if (sessErr) throw sessErr;

  const orders = await fetchSessionOrders(db, session.id);
  for (const order of orders) {
    if (["received", "shopping_soon", "shopping"].includes(order.status)) {
      order.status = "purchased";
      recalculateOrderTotals(order, settings);
      await db
        .from("orders")
        .update({
          status: "purchased",
          merchandise_actual: order.merchandise_actual,
          tax_amount: order.tax_amount,
          final_total: order.final_total,
          change_owed: order.change_owed,
          updated_at: order.updated_at,
        })
        .eq("id", order.id);
    }
  }

  return mapSession(sessionRow as Record<string, unknown>);
}
