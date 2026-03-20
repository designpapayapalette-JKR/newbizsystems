import Link from "next/link";
import { Sparkles, MessageCircle, Clock } from "lucide-react";
import { FlaskConical } from "lucide-react";

function BetaBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      <FlaskConical className="h-2.5 w-2.5" /> Beta
    </span>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo-full.png" alt="NewBiz Systems" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              A premium business tool designed and developed by{" "}
              <a href="https://www.papayapalette.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                Papaya Palette
              </a>. We build practical digital tools for Indian SMEs.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-sm mb-3">Products</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-1.5">
                <Link href="/ERP/signup" className="hover:text-gray-900 transition-colors">NewBiz ERP</Link>
                <BetaBadge />
              </li>
              <li className="text-gray-400">NewBiz Books <span className="text-[10px]">(soon)</span></li>
              <li className="text-gray-400">NewBiz Campaigns <span className="text-[10px]">(soon)</span></li>
              <li className="text-gray-400">NewBiz Pay <span className="text-[10px]">(soon)</span></li>
              <li className="text-gray-400">NewBiz Store <span className="text-[10px]">(soon)</span></li>
              <li className="text-gray-400">NewBiz HR <span className="text-[10px]">(soon)</span></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-sm mb-3">Company</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#why-us" className="hover:text-gray-900 transition-colors">Why NewBiz</a></li>
              <li><a href="#testimonials" className="hover:text-gray-900 transition-colors">Customer Stories</a></li>
              <li><a href="#notify" className="hover:text-gray-900 transition-colors">Early Access</a></li>
              <li><Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
              <li><span className="text-gray-400">Careers</span></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-sm mb-3">Support</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a
                  href="https://wa.me/918287973084"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-green-500" /> +91 82879 73084
                </a>
              </li>
              <li className="flex items-start gap-1.5 text-xs text-gray-500 leading-normal">
                <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" /> 
                <span>
                  H-213, Sector 63 Rd, Electronic City,<br />
                  H Block, Sector 63, Noida,<br />
                  Uttar Pradesh 201309
                </span>
              </li>
              <li><Link href="/ERP/login" className="hover:text-gray-900 transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} NewBiz Systems. All rights reserved. · All products currently in Beta.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-gray-600 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
