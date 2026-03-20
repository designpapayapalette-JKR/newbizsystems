"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-full.png" alt="NewBiz Systems" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="/#products" className="hover:text-gray-900 transition-colors">Products</a>
          <a href="/#crm" className="hover:text-gray-900 transition-colors">NewBiz CRM</a>
          <a href="/#why-us" className="hover:text-gray-900 transition-colors">Why NewBiz</a>
          <a href="/#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          <a href="/#notify" className="hover:text-gray-900 transition-colors">Early Access</a>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/ERP/login" className="hidden sm:inline-flex text-sm text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
            Sign In
          </Link>
          <Link
            href="/ERP/signup"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Try CRM Free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
