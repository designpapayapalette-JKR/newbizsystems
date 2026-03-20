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
      {/* Actions */}
      <div className="flex items-center justify-end flex-wrap gap-2">
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
