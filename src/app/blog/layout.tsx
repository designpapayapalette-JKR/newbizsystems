import Link from "next/link";

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo-full.png" alt="NewBiz ERP" className="h-7 w-auto min-w-[100px]" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← All articles</Link>
            <Link href="/ERP/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">Try Free</Link>
          </div>
        </div>
      </nav>

      {children}

      {/* Footer CTA */}
      <div className="border-t mt-16 bg-slate-950 py-14 px-4 text-center">
        <p className="text-slate-400 text-sm mb-2">Found this helpful?</p>
        <h2 className="text-2xl font-bold text-white mb-4">Try NewBiz ERP free — for your business</h2>
        <Link href="/ERP/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors">
          Get Started Free →
        </Link>
      </div>
    </div>
  );
}
