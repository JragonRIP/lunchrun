import { AdminShell } from "@/components/admin/admin-shell";
import { isDemoMode } from "@/lib/services/data";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell demo={isDemoMode()}>{children}</AdminShell>;
}
