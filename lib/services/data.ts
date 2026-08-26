import { isDemoMode } from "@/lib/demo/store";
import * as demo from "@/lib/services/demo-data";
import * as sb from "@/lib/services/supabase-data";
import type {
  AppSettings,
  Category,
  LunchRunSession,
  Order,
  PriceImportItem,
  Product,
} from "@/lib/types";
import type { CheckoutInput } from "@/lib/validation/schemas";

export { isDemoMode };
export { isOrderingOpen } from "@/lib/ordering";

function api() {
  return isDemoMode() ? demo : sb;
}

export async function getCatalog() {
  return api().getCatalog();
}

export async function getOrderByToken(token: string) {
  return api().getOrderByToken(token);
}

export async function findOrderByCodeAndName(code: string, name: string) {
  return api().findOrderByCodeAndName(code, name);
}

export async function submitOrder(input: CheckoutInput) {
  return api().submitOrder(input);
}

export async function getAdminDashboard() {
  return api().getAdminDashboard();
}

export async function getOrders(filter?: string, search?: string) {
  return api().getOrders(filter, search);
}

export async function getShoppingList() {
  return api().getShoppingList();
}

export async function updateShelfPrice(productKey: string, price: number) {
  return api().updateShelfPrice(productKey, price);
}

export async function setItemUnavailable(productKey: string) {
  return api().setItemUnavailable(productKey);
}

export async function applySubstitution(input: {
  orderItemId: string;
  replacementName: string;
  replacementPrice: number;
}) {
  return api().applySubstitution(input);
}

export async function updateOrderPayment(
  orderId: string,
  amountPaid: number,
  paymentStatus?: Order["payment_status"],
) {
  return api().updateOrderPayment(orderId, amountPaid, paymentStatus);
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
) {
  return api().updateOrderStatus(orderId, status);
}

export async function markDelivered(orderId: string) {
  return api().markDelivered(orderId);
}

export async function markNotFound(orderId: string) {
  return api().markNotFound(orderId);
}

export async function getProducts(): Promise<Product[]> {
  return api().getProducts();
}

export async function getCategories(): Promise<Category[]> {
  return api().getCategories();
}

export async function getSettings(): Promise<AppSettings> {
  return api().getSettings();
}

export async function saveSettings(settings: AppSettings) {
  return api().saveSettings(settings);
}

export async function setTestMode(enabled: boolean) {
  return api().setTestMode(enabled);
}

export async function updateSessionStatus(
  status: LunchRunSession["status"],
) {
  return api().updateSessionStatus(status);
}

export async function reopenOrders() {
  return api().reopenOrders();
}

export async function upsertProduct(
  product: Partial<Product> & { name: string; category_id: string },
) {
  return api().upsertProduct(product);
}

export async function archiveProduct(id: string) {
  return api().archiveProduct(id);
}

export async function importPrices(items: PriceImportItem[], source = "api") {
  return api().importPrices(items, source);
}

export async function getPriceData() {
  return api().getPriceData();
}

export async function getRevenueSummary() {
  return api().getRevenueSummary();
}

export async function updateCategoryOrder(orderedIds: string[]) {
  return api().updateCategoryOrder(orderedIds);
}

export async function allocateReceiptTax(totalTax: number) {
  return api().allocateReceiptTax(totalTax);
}

export async function demoAdminLogin(email: string, password: string) {
  return demo.demoAdminLogin(email, password);
}

export async function demoAdminLogout() {
  return demo.demoAdminLogout();
}

export async function isAdminAuthenticated() {
  return api().isAdminAuthenticated();
}

export async function togglePickedUp(productKey: string, picked: boolean) {
  return api().togglePickedUp(productKey, picked);
}

export async function finishShopping() {
  return api().finishShopping();
}
