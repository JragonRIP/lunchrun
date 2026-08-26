import { SettingsClient } from "@/components/admin/settings-client";
import { getCatalog, getCategories, getSettings } from "@/lib/services/data";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [settings, catalog, categories] = await Promise.all([
    getSettings(),
    getCatalog(),
    getCategories(),
  ]);
  return (
    <SettingsClient
      settings={settings}
      stores={catalog.stores}
      categories={categories}
    />
  );
}
