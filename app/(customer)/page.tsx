import { CatalogClient } from "@/components/customer/catalog-client";
import { getCatalog } from "@/lib/services/data";

export default async function HomePage() {
  const catalog = await getCatalog();

  return (
    <CatalogClient
      products={catalog.products}
      categories={catalog.categories}
      session={catalog.session}
      store={catalog.store}
      settings={catalog.settings}
      sessionAccepting={catalog.sessionAccepting}
      orderCount={catalog.orderCount}
      demo={catalog.demo}
    />
  );
}
