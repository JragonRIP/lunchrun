import { QrClient } from "@/components/admin/qr-client";
import { effectiveServiceFee } from "@/lib/constants";
import { getSettings } from "@/lib/services/data";
import { getSiteUrl } from "@/lib/supabase/config";

export const metadata = { title: "QR Code" };

export default async function AdminQrPage() {
  const settings = await getSettings();
  return (
    <QrClient
      siteUrl={getSiteUrl()}
      fee={effectiveServiceFee(settings)}
      cutoff={settings.default_cutoff}
    />
  );
}
