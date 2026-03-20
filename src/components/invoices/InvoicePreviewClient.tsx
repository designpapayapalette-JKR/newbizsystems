"use client";
import { useState } from "react";

const TEMPLATES = [
  { id: "classic",   label: "Classic",        desc: "Clean header with branded accents" },
  { id: "modern",    label: "Modern Minimal",  desc: "Sleek monochrome, luxury feel" },
  { id: "bold",      label: "Bold Pro",        desc: "Dark header band, high contrast" },
  { id: "elegant",   label: "Elegant",         desc: "Sidebar stripe, two-tone layout" },
  { id: "corporate", label: "Corporate",       desc: "Professional grid layout" },
];

export function InvoicePreviewClient({
  invoiceId,
  invoiceNumber,
  defaultTemplate = "classic",
}: {
  invoiceId: string;
  invoiceNumber: string;
  defaultTemplate?: string;
}) {
  const [selected, setSelected] = useState(defaultTemplate);

  const pdfSrc = `/api/invoices/${invoiceId}/pdf?template=${selected}`;

  function handlePrint() {
    const iframe = document.getElementById("invoice-iframe") as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  return (
    <div className="space-y-4">
      {/* Template selector */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Choose Template</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`group relative px-4 py-2.5 rounded-lg border-2 text-left transition-all ${
                selected === t.id
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50"
              }`}
            >
              <div className={`text-sm font-semibold ${selected === t.id ? "text-white" : "text-gray-800"}`}>{t.label}</div>
              <div className={`text-xs mt-0.5 ${selected === t.id ? "text-white/75" : "text-gray-400"}`}>{t.desc}</div>
              {selected === t.id && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
        {selected === defaultTemplate ? (
          <p className="text-xs text-muted-foreground mt-2">✓ Using your organisation&apos;s default template. Change the default in <a href="/settings/organization" className="underline hover:text-foreground">Settings → Organization</a>.</p>
        ) : (
          <p className="text-xs text-amber-600 mt-2">⚡ You&apos;ve overridden the default for this preview. Your org default is <strong>{TEMPLATES.find(t => t.id === defaultTemplate)?.label ?? defaultTemplate}</strong>.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          Previewing: <span className="font-medium text-gray-900">{TEMPLATES.find(t => t.id === selected)?.label}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </button>
          <a
            href={pdfSrc}
            download={`${invoiceNumber}.html`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="rounded-xl border overflow-hidden bg-white shadow-sm" style={{ height: "78vh" }}>
        <iframe
          id="invoice-iframe"
          key={selected}
          src={pdfSrc}
          title={`Invoice ${invoiceNumber} — ${selected}`}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
