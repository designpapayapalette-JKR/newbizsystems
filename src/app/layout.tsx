import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://newbizsystems.in'
  ),
  title: {
    default: "NewBiz CRM | Lead Management for Indian SMEs",
    template: "%s | NewBiz CRM",
  },
  description: "Affordable, practical digital tools and CRM software for Indian small businesses and startups. Manage leads, track follow-ups, and automate invoicing.",
  keywords: [
    "CRM",
    "Small Business CRM",
    "Indian SME",
    "Lead Management Software",
    "Sales Tracking",
    "Invoicing Software India",
    "Client Management",
    "NewBiz Systems"
  ],
  authors: [{ name: "Papaya Palette", url: "https://www.papayapalette.com/" }],
  creator: "Papaya Palette",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "NewBiz CRM | Designed for Indian Small Businesses",
    description: "Manage your leads, track conversations, and close deals faster with NewBiz CRM. No hidden fees, real human support.",
    siteName: "NewBiz Systems",
    images: [
      {
        url: "/logo-full.png",
        width: 1200,
        height: 630,
        alt: "NewBiz Systems Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewBiz CRM | Simple. Practical. Affordable.",
    description: "The CRM built specifically for Indian SMEs and startups.",
    images: ["/logo-full.png"],
    creator: "@papayapalette",
  },
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
