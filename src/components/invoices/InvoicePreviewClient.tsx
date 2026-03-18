"use client";

export function InvoicePreviewClient({ invoiceId, invoiceNumber }: { invoiceId: string; invoiceNumber: string }) {
  function handlePrint() {
    const iframe = document.getElementById("invoice-iframe") as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save as PDF
        </button>
      </div>
      <div className="rounded-lg border overflow-hidden bg-white" style={{ height: "80vh" }}>
        <iframe
          id="invoice-iframe"
          src={`/api/invoices/${invoiceId}/pdf`}
          title={`Invoice ${invoiceNumber}`}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
