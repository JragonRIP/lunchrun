"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { formatMoney } from "@/lib/utils";

export function QrClient({
  siteUrl,
  fee,
  cutoff,
}: {
  siteUrl: string;
  fee: number;
  cutoff: string;
}) {
  const download = () => {
    const svg = document.getElementById("lr-qr");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lunch-run-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">QR Code</h1>
          <p className="text-neutral-500">Printable scan-to-order poster</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={download}>Download QR</Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-md rounded-[32px] bg-lr-black p-8 text-center text-white print:max-w-none print:rounded-none print:p-12">
        <Logo light size="lg" className="justify-center" />
        <p className="mt-2 text-sm font-bold uppercase tracking-[0.2em] text-lr-yellow">
          Snacks delivered at lunch.
        </p>
        <div className="mx-auto mt-6 inline-block rounded-3xl bg-white p-4">
          <QRCodeSVG id="lr-qr" value={siteUrl} size={220} level="M" />
        </div>
        <p className="mt-6 text-lg font-black text-lr-yellow">SCAN TO ORDER</p>
        <p className="mt-3 text-sm text-neutral-300">
          {formatMoney(fee)} per order · Orders close at {cutoff}
        </p>
        <p className="mt-6 text-xs text-neutral-500">{siteUrl}</p>
      </div>
    </div>
  );
}
