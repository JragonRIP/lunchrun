import type { AppSettings, Order, OrderItem } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

const RESOLVED_STATUSES = new Set([
  "found",
  "substituted",
  "unavailable",
  "skipped",
]);

export function isLineResolved(item: OrderItem): boolean {
  return RESOLVED_STATUSES.has(item.status);
}

export function allLinesResolved(items: OrderItem[] | undefined): boolean {
  const list = items ?? [];
  return list.length > 0 && list.every(isLineResolved);
}

export function purchasedItems(items: OrderItem[] | undefined): OrderItem[] {
  return (items ?? []).filter(
    (i) => i.status === "found" || i.status === "substituted",
  );
}

export function itemUnitPrice(item: OrderItem): number {
  if (item.status === "substituted") {
    return item.replacement_price ?? item.actual_price ?? 0;
  }
  return item.actual_price ?? 0;
}

export function merchandiseFromItems(items: OrderItem[] | undefined): number {
  return roundMoney(
    purchasedItems(items).reduce(
      (sum, item) => sum + itemUnitPrice(item) * item.quantity,
      0,
    ),
  );
}

/**
 * Recompute merchandise / tax / final total / change.
 *
 * final_total is only set when every line item is resolved (found, substituted,
 * unavailable, or skipped). Mid-shop pricing updates merchandise_actual only.
 */
export function recalculateOrderTotals(
  order: Order,
  settings: AppSettings,
): Order {
  const items = order.items ?? [];
  const purchased = purchasedItems(items);
  const merchandise = merchandiseFromItems(items);
  const readyToBill = allLinesResolved(items);

  order.merchandise_actual =
    purchased.length > 0 ? merchandise : readyToBill ? 0 : null;

  if (!readyToBill) {
    order.tax_amount =
      settings.tax_mode === "receipt"
        ? roundMoney(items.reduce((sum, i) => sum + i.tax_amount, 0))
        : 0;
    order.final_total = null;
    order.change_owed = 0;
    order.updated_at = new Date().toISOString();
    return order;
  }

  // Receipt mode allocates tax onto items. Simple mode: shelf price is what
  // was paid at the register (tax-inclusive).
  const tax =
    settings.tax_mode === "receipt"
      ? roundMoney(items.reduce((sum, i) => sum + i.tax_amount, 0))
      : 0;

  // Nothing found → refund prepaid (no fee if nothing delivered).
  const finalTotal =
    purchased.length === 0
      ? 0
      : roundMoney(merchandise + tax + order.service_fee + order.tip_amount);

  order.tax_amount = tax;
  order.final_total = finalTotal;
  order.change_owed = roundMoney(Math.max(0, order.amount_paid - finalTotal));
  order.updated_at = new Date().toISOString();
  return order;
}

/** Cash the student should hand over before shopping. */
export function prepayAmount(order: Pick<Order, "max_authorized_total">): number {
  return order.max_authorized_total;
}

/** Actual amount due after shopping (null if not ready yet). */
export function amountDue(order: Order): number | null {
  return order.final_total;
}

/** Change to return: prepaid − actual due. */
export function changeDue(order: Order): number {
  if (order.final_total == null) return 0;
  return roundMoney(Math.max(0, order.amount_paid - order.final_total));
}

/** Shopping-list key that keeps custom flavors distinct. */
export function shoppingItemKey(item: {
  product_id: string | null;
  brand: string | null;
  product_name: string;
  size: string | null;
  flavor?: string | null;
  is_custom?: boolean;
}): string {
  if (item.product_id) return item.product_id;
  const parts = [
    item.brand ?? "",
    item.product_name,
    item.size ?? "",
    item.flavor ?? "",
  ]
    .map((p) => p.trim().toLowerCase())
    .join("|");
  return `custom:${parts}`;
}
