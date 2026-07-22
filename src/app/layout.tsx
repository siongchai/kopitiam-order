import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

export const metadata: Metadata = {
  title: "Kopitiam Order",
  description: "Group drink ordering for kopitiam & hawker centres",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kopitiam Order",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FEFCF9] antialiased touch-manipulation">
        <div className="safe-area-inset">{children}</div>
        <span className="fixed bottom-1 right-2 text-[10px] text-[#8B7355]/40 pointer-events-none">
          v1.1.0
        </span>
      </body>
    </html>
  );
}
