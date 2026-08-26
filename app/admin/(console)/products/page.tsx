import { ProductsClient } from "@/components/admin/products-client";
import { getCategories, getProducts } from "@/lib/services/data";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  return <ProductsClient products={products} categories={categories} />;
}
