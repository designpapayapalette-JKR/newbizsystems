"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to API / Supabase table
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-blue-300 font-medium text-sm">
        ✓ Got it! We&apos;ll notify you when new products launch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 max-w-sm bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <Mail className="h-4 w-4" /> Notify Me
      </button>
    </form>
  );
}
