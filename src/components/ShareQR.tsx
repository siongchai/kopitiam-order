"use client";

import { QRCodeSVG } from "qrcode.react";

interface ShareQRProps {
  orderId: string;
}

export default function ShareQR({ orderId }: ShareQRProps) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/order/${orderId}`
      : "";

  if (!url) return null;

  return (
    <div className="card-elevated p-6 mb-4 flex flex-col items-center">
      <p className="section-label mb-4">Scan to join</p>
      <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-50">
        <QRCodeSVG
          value={url}
          size={180}
          level="M"
          bgColor="#ffffff"
          fgColor="#6B4C35"
        />
      </div>
      <p className="text-[10px] text-[#8B7355] mt-3 break-all text-center max-w-[200px]">
        {url}
      </p>
    </div>
  );
}
