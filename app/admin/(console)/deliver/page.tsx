import { DeliverClient } from "@/components/admin/deliver-client";
import { getOrders } from "@/lib/services/data";

export const metadata = { title: "Deliveries" };

export default async function AdminDeliverPage() {
  const orders = await getOrders();
  return <DeliverClient orders={orders} />;
}
