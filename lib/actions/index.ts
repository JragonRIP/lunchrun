"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, requireAdmin } from "@/lib/auth/admin";
import {
  allocateReceiptTax,
  applySubstitution,
  archiveProduct,
  demoAdminLogin,
  demoAdminLogout,
  finishShopping,
  getOrderByToken,
  isDemoMode,
  markDelivered,
  markNotFound,
  reopenOrders,
  saveSettings,
  setItemUnavailable,
  submitOrder,
  togglePickedUp,
  updateCategoryOrder,
  updateOrderPayment,
  updateOrderStatus,
  updateSessionStatus,
  updateShelfPrice,
  upsertProduct,
} from "@/lib/services/data";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { AppSettings, Order, Product } from "@/lib/types";
import { checkoutSchema, settingsSchema } from "@/lib/validation/schemas";

export async function placeOrderAction(raw: unknown) {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Please check your order details." };
  }
  const result = await submitOrder(parsed.data);
  if (result.ok) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/shop");
  }
  return result;
}

export async function trackOrderAction(token: string) {
  return getOrderByToken(token);
}

export async function adminLoginAction(email: string, password: string) {
  if (isDemoMode()) {
    const result = await demoAdminLogin(email, password);
    if (result.ok) {
      const jar = await cookies();
      jar.set(ADMIN_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 12,
      });
    }
    return result;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      return { ok: false as const, error: error?.message || "Login failed" };
    }

    const service = createServiceClient();
    const { data: admin } = await service
      .from("admins")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!admin) {
      await supabase.auth.signOut();
      return {
        ok: false as const,
        error: "This account is not authorized as an admin.",
      };
    }

    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      error: e instanceof Error ? e.message : "Login failed",
    };
  }
}

export async function adminLogoutAction() {
  if (isDemoMode()) {
    await demoAdminLogout();
    const jar = await cookies();
    jar.delete(ADMIN_COOKIE);
  } else {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  revalidatePath("/admin");
}

export async function setShelfPriceAction(productKey: string, price: number) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const result = await updateShelfPrice(productKey, price);
  revalidatePath("/admin/shop");
  revalidatePath("/admin/deliver");
  revalidatePath("/admin/orders");
  return { ok: true as const, ...result };
}

export async function markUnavailableAction(productKey: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await setItemUnavailable(productKey);
  revalidatePath("/admin/shop");
  return { ok: true as const };
}

export async function substituteAction(input: {
  orderItemId: string;
  replacementName: string;
  replacementPrice: number;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const result = await applySubstitution(input);
  revalidatePath("/admin/shop");
  revalidatePath("/admin/orders");
  return result;
}

export async function paymentAction(
  orderId: string,
  amountPaid: number,
  status?: Order["payment_status"],
) {
  const auth = await requireAdmin();
  if (!auth.ok) return null;
  const order = await updateOrderPayment(orderId, amountPaid, status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/deliver");
  return order;
}

export async function statusAction(orderId: string, status: Order["status"]) {
  const auth = await requireAdmin();
  if (!auth.ok) return null;
  const order = await updateOrderStatus(orderId, status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/deliver");
  return order;
}

export async function deliverAction(orderId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await markDelivered(orderId);
  revalidatePath("/admin/deliver");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function notFoundAction(orderId: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await markNotFound(orderId);
  revalidatePath("/admin/deliver");
  return { ok: true as const };
}

export async function saveSettingsAction(raw: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid settings" };
  }
  await saveSettings(parsed.data as AppSettings);
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function saveProductAction(
  product: Partial<Product> & { name: string; category_id: string },
) {
  const auth = await requireAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const saved = await upsertProduct(product);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return saved;
}

export async function archiveProductAction(id: string) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await archiveProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true as const };
}

export async function reopenOrdersAction() {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await reopenOrders();
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function sessionStatusAction(
  status: Parameters<typeof updateSessionStatus>[0],
) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await updateSessionStatus(status);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function categoryOrderAction(ids: string[]) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await updateCategoryOrder(ids);
  revalidatePath("/admin/shop");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function receiptTaxAction(totalTax: number) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await allocateReceiptTax(totalTax);
  revalidatePath("/admin/shop");
  revalidatePath("/admin/deliver");
  return { ok: true as const };
}

export async function togglePickedAction(productKey: string, picked: boolean) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await togglePickedUp(productKey, picked);
  revalidatePath("/admin/shop");
  return { ok: true as const };
}

export async function finishShoppingAction() {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  await finishShopping();
  revalidatePath("/admin");
  revalidatePath("/admin/shop");
  revalidatePath("/admin/deliver");
  return { ok: true as const };
}
