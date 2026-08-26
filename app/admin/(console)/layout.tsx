import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";
import { getSettings, isDemoMode } from "@/lib/services/data";

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    redirect("/admin/login");
  }

  const settings = await getSettings();
  return (
    <AdminShell demo={isDemoMode()} testMode={settings.test_mode}>
      {children}
    </AdminShell>
  );
}
