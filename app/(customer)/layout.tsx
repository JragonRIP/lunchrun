import { CustomerShell } from "@/components/customer/customer-shell";
import { getOrderingContext } from "@/lib/services/data";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getOrderingContext();

  return (
    <CustomerShell
      settings={ctx.settings}
      sessionAccepting={ctx.sessionAccepting}
      cutoffTime={ctx.session.cutoff_time}
    >
      {children}
    </CustomerShell>
  );
}
