import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRM — Small Business CRM",
  description: "Lead management, follow-ups, invoicing, and payments for small businesses",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.className} antialiased text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 tracking-[0.01em]`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
