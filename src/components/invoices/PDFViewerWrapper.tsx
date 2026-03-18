"use client";
import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "./InvoicePDFDocument";
import { Loader2 } from "lucide-react";

export default function PDFViewerWrapper({ data }: { data: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading preview…</span>
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
      <InvoicePDFDocument data={data} />
    </PDFViewer>
  );
}
