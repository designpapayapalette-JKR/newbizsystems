import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://newbizsystems.online'
  ),
  title: {
    default: "NewBiz ERP | All-in-One ERP Software for Indian SMEs & Startups",
    template: "%s | NewBiz ERP",
  },
  description: "NewBiz ERP is a free, all-in-one ERP platform built for Indian small businesses and startups. Manage leads, HR & payroll (PF/ESI), GST invoicing, PhonePe payments, helpdesk, and more — all in one place.",
  keywords: [
    "ERP software India",
    "ERP for Indian SMEs",
    "ERP for startups India",
    "free ERP software India",
    "all in one business software India",
    "CRM software India",
    "GST invoicing software",
    "HR payroll software India",
    "PF ESI payroll software",
    "attendance management software India",
    "lead management software India",
    "small business software India",
    "best ERP for startups India",
    "NewBiz ERP",
    "NewBiz Systems",
    "PhonePe payment integration",
    "WhatsApp CRM India",
    "Indian startup tools",
    "SME management software",
    "helpdesk software India"
  ],
  authors: [{ name: "Papaya Palette", url: "https://www.papayapalette.com/" }],
  creator: "Papaya Palette",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    title: "NewBiz ERP | All-in-One Business Platform for Indian SMEs",
    description: "Replace 6 tools with one. CRM, HR & Payroll, GST Invoicing, Payments — all in one free ERP for Indian small businesses and startups.",
    siteName: "NewBiz Systems",
    images: [
      {
        url: "/logo-full.png",
        width: 1200,
        height: 630,
        alt: "NewBiz ERP — All-in-One Platform for Indian SMEs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewBiz ERP | Free ERP for Indian SMEs & Startups",
    description: "Stop juggling 6 apps. One ERP for CRM, HR, GST invoicing & payments. Built for Indian businesses.",
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
