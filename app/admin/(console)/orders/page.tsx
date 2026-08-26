import { OrdersClient } from "@/components/admin/orders-client";
import { getOrders } from "@/lib/services/data";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return <OrdersClient orders={orders} />;
}
