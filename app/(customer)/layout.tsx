import { CustomerShell } from "@/components/customer/customer-shell";
import { getCatalog } from "@/lib/services/data";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catalog = await getCatalog();

  return (
    <CustomerShell
      settings={catalog.settings}
      orderingOpen={catalog.orderingOpen}
    >
      {children}
    </CustomerShell>
  );
}
