import { PricesClient } from "@/components/admin/prices-client";
import { getPriceData } from "@/lib/services/data";

export const metadata = { title: "Price Data" };

export default async function AdminPricesPage() {
  const data = await getPriceData();
  return (
    <PricesClient
      products={data.products}
      history={data.history}
      pending={data.pending}
      logs={data.logs}
    />
  );
}
