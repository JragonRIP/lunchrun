import { AdminShell } from "@/components/admin/admin-shell";
import { getSettings, isDemoMode } from "@/lib/services/data";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <AdminShell demo={isDemoMode()} testMode={settings.test_mode}>
      {children}
    </AdminShell>
  );
}
