import { ShopClient } from "@/components/admin/shop-client";
import { getShoppingList } from "@/lib/services/data";

export const metadata = { title: "Shopping Mode" };

export default async function AdminShopPage() {
  const items = await getShoppingList();
  return <ShopClient items={items} />;
}
