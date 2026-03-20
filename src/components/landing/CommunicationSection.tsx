import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, Mail, Bell } from "lucide-react";

export function CommunicationSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-3">On mobile, on desktop</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Reach every lead in one tap</h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              Call, WhatsApp, or email any lead directly from NewBiz CRM — no copy-pasting numbers, no switching apps.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MessageCircle, label: "WhatsApp", sub: "Send a DM in one tap" },
              { icon: Phone, label: "Direct Call", sub: "Tap to call from mobile" },
              { icon: Mail, label: "Email", sub: "Pre-filled from lead data" },
              { icon: Bell, label: "Reminders", sub: "Push alerts with sound" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-white border border-white/20">
                  <Icon className="h-6 w-6 mb-2 text-blue-200" />
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{item.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
