import Link from "next/link";
import { CheckCircle2, ChevronRight, Sparkles, FlaskConical, Clock } from "lucide-react";
import { products } from "@/constants/landingData";

export function ProductsSection() {
  return (
    <section id="products" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">The NewBiz Suite</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">One platform, many tools</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            We're building a suite of tools designed around how Indian small businesses actually work — starting with CRM and expanding product by product. Everything launches publicly one by one.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const Icon = product.icon;
            const isBeta = product.status === "beta";
            return (
              <div
                key={product.name}
                className={`relative rounded-2xl border overflow-hidden flex flex-col transition-all ${
                  isBeta ? "border-blue-200 shadow-md shadow-blue-50 hover:shadow-lg" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${product.color}`} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${product.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isBeta ? (
                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        <FlaskConical className="h-2.5 w-2.5" /> Beta
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        <Clock className="h-2.5 w-2.5" /> Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-0.5">{product.name}</h3>
                  <p className={`text-sm font-medium mb-3 ${isBeta ? "text-blue-600" : "text-gray-400"}`}>{product.tagline}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{product.desc}</p>

                  <ul className="space-y-1.5 mb-6">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isBeta ? "text-blue-500" : "text-gray-300"}`} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={product.href}
                    className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                      isBeta
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-500 cursor-default"
                    }`}
                  >
                    {product.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">More products launching through 2025–26</p>
            <p className="text-sm text-gray-500 mt-0.5">
              We're building each tool carefully, in stages. Sign up for early access and be among the first to use new products before public launch — at beta pricing.
            </p>
          </div>
          <a
            href="#notify"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shrink-0"
          >
            Get notified <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
