import { OrderConfirmation } from "@/components/customer/order-confirmation";
import { getOrderByToken, getSettings } from "@/lib/services/data";
import { redirect } from "next/navigation";

export const metadata = { title: "Order Received" };

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; paid?: string }>;
}) {
  const { token, paid } = await searchParams;
  if (!token) redirect("/");
  const [order, settings] = await Promise.all([
    getOrderByToken(token),
    getSettings(),
  ]);
  if (!order) redirect("/");
  return (
    <OrderConfirmation
      order={order}
      settings={settings}
      stripePaidHint={paid === "1"}
    />
  );
}
