import { OrderConfirmation } from "@/components/customer/order-confirmation";
import { getOrderByToken } from "@/lib/services/data";
import { redirect } from "next/navigation";

export const metadata = { title: "Order Received" };

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/");
  const order = await getOrderByToken(token);
  if (!order) redirect("/");
  return <OrderConfirmation order={order} />;
}
