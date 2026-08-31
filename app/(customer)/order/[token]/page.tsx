import { OrderStatusView } from "@/components/customer/order-status-view";
import { EmptyState } from "@/components/ui/empty-state";
import { getOrderByToken, getSettings } from "@/lib/services/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Order Status" };

export default async function OrderTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  const settings = await getSettings();

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="Double-check your link or look up your order code."
        action={
          <Link href="/track">
            <Button>Track order</Button>
          </Link>
        }
      />
    );
  }

  return <OrderStatusView order={order} settings={settings} />;
}
