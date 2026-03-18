import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function fmt(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

/* ─────────────────────────────────────────────
   Styles (no `gap` — not supported in v3)
───────────────────────────────────────────── */
function makeStyles(brand: string) {
  return StyleSheet.create({
    page: {
      fontFamily: "Helvetica",
      fontSize: 9,
      color: "#1a1a1a",
      paddingTop: 36,
      paddingBottom: 60,
      paddingHorizontal: 40,
      backgroundColor: "#ffffff",
    },

    /* HEADER */
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: 16,
      borderBottomWidth: 3,
      borderBottomColor: brand,
      marginBottom: 22,
    },
    logoBox: { width: 90, height: 38, marginBottom: 8, objectFit: "contain" },
    companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: brand, marginBottom: 4 },
    companyDetail: { fontSize: 8, color: "#4b5563", lineHeight: 1.5 },

    invoiceWordCol: { alignItems: "flex-end" },
    invoiceWord: { fontSize: 28, fontFamily: "Helvetica-Bold", color: brand, marginBottom: 10 },

    metaGrid: { flexDirection: "row" },
    metaField: { flexDirection: "column", marginLeft: 10 },
    metaLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#6b7280", marginBottom: 2 },
    metaValue: {
      fontSize: 8.5,
      color: "#1f2937",
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },

    /* BILLING */
    billingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    billCol: { flex: 1, marginRight: 16 },
    billColLast: { flex: 1 },
    billLabel: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: brand,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    billBox: {
      backgroundColor: "#f9fafb",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderStyle: "dashed",
      borderRadius: 4,
      padding: 10,
      minHeight: 70,
    },
    billName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 3 },
    billDetail: { fontSize: 8.5, color: "#4b5563", lineHeight: 1.5 },

    /* TABLE */
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: brand,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 2,
    },
    thText: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: "#ffffff" },
    tableRow: {
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    tableRowAlt: {
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: "#f9fafb",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    descCol: { flex: 1 },
    hsnText: { fontSize: 7, color: "#9ca3af", marginTop: 1 },
    qtyCol: { width: 40, textAlign: "center" },
    priceCol: { width: 72, textAlign: "right" },
    amtCol: { width: 80, textAlign: "right" },

    /* TOTALS + NOTES */
    bottomSection: { flexDirection: "row", marginTop: 16 },
    notesCol: { flex: 1, marginRight: 20 },
    notesTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1f2937", marginBottom: 6 },
    notesBox: {
      backgroundColor: "#f9fafb",
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderStyle: "dashed",
      borderRadius: 4,
      padding: 10,
      minHeight: 60,
    },
    notesText: { fontSize: 8, color: "#4b5563", lineHeight: 1.6 },

    totalsCol: { width: 210 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    totalLabel: { fontFamily: "Helvetica-Bold", color: "#4b5563" },
    totalValue: { fontFamily: "Helvetica-Bold", color: "#1f2937" },
    grandRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginTop: 2,
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: brand,
      backgroundColor: "#eff6ff",
      borderRadius: 2,
    },
    grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: brand },
    grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: brand },

    /* PAYMENT BANNER */
    paymentBanner: {
      backgroundColor: "#fef3c7",
      borderLeftWidth: 4,
      borderLeftColor: "#f59e0b",
      borderRadius: 4,
      padding: 10,
      marginTop: 18,
    },
    paymentBannerTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#78350f", marginBottom: 3 },
    paymentBannerText: { fontSize: 8, color: "#78350f", lineHeight: 1.5 },

    /* FOOTER */
    footer: {
      position: "absolute",
      bottom: 28,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      paddingTop: 12,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    footerCol: { flex: 1, paddingHorizontal: 4 },
    footerColMid: { flex: 1, paddingHorizontal: 12, borderLeftWidth: 1, borderLeftColor: "#e5e7eb" },
    footerTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1f2937", marginBottom: 4 },
    footerText: { fontSize: 7.5, color: "#4b5563", lineHeight: 1.6 },
    thankYou: {
      fontSize: 8,
      color: "#6b7280",
      textAlign: "center",
      marginTop: 14,
      fontFamily: "Helvetica-Oblique",
    },
  });
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface PDFInvoiceData {
  invoiceNumber: string;
  title: string | null;
  status: string;
  issueDate: string;
  dueDate: string | null;
  subtotal: number;
  discount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string | null;
  terms: string | null;
  taxLabel?: string | null;
  lineItems: {
    description: string;
    hsn_sac?: string | null;
    quantity: number;
    unit_price: number;
    amount: number;
  }[];
  org: {
    name: string;
    logo_url?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    invoice_color?: string | null;
    invoice_footer?: string | null;
    gstin?: string | null;
    tax_label?: string | null;
    pan?: string | null;
    hsn_sac?: string | null;
  };
  lead?: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    gstin?: string | null;
    state?: string | null;
  } | null;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export function InvoicePDFDocument({ data }: { data: PDFInvoiceData }) {
  const brand = data.org.invoice_color ?? "#1e40af";
  const s = makeStyles(brand);
  const currency = data.currency ?? "INR";
  const taxLabel = data.taxLabel ?? data.org.tax_label ?? "GST";
  const footerNote = data.org.invoice_footer ?? "Thank you for your business!";

  return (
    <Document title={data.invoiceNumber}>
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={{ maxWidth: 260 }}>
            {data.org.logo_url ? (
              <Image style={s.logoBox} src={data.org.logo_url} />
            ) : null}
            <Text style={s.companyName}>{data.org.name}</Text>
            {data.org.address ? <Text style={s.companyDetail}>{data.org.address}</Text> : null}
            {data.org.phone ? <Text style={s.companyDetail}>Phone: {data.org.phone}</Text> : null}
            {data.org.email ? <Text style={s.companyDetail}>Email: {data.org.email}</Text> : null}
            {data.org.website ? <Text style={s.companyDetail}>Website: {data.org.website}</Text> : null}
          </View>

          <View style={s.invoiceWordCol}>
            <Text style={s.invoiceWord}>INVOICE</Text>
            <View style={s.metaGrid}>
              <View style={s.metaField}>
                <Text style={s.metaLabel}>Invoice #</Text>
                <Text style={s.metaValue}>{data.invoiceNumber}</Text>
              </View>
              <View style={s.metaField}>
                <Text style={s.metaLabel}>Status</Text>
                <Text style={s.metaValue}>{data.status.toUpperCase()}</Text>
              </View>
            </View>
            <View style={[s.metaGrid, { marginTop: 6 }]}>
              <View style={s.metaField}>
                <Text style={s.metaLabel}>Invoice Date</Text>
                <Text style={s.metaValue}>{fmtDate(data.issueDate)}</Text>
              </View>
              <View style={s.metaField}>
                <Text style={s.metaLabel}>Due Date</Text>
                <Text style={s.metaValue}>{fmtDate(data.dueDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── BILLING ── */}
        <View style={s.billingRow}>
          <View style={s.billCol}>
            <Text style={s.billLabel}>Bill To</Text>
            <View style={s.billBox}>
              {data.lead ? (
                <View>
                  <Text style={s.billName}>{data.lead.name}</Text>
                  {data.lead.company ? <Text style={s.billDetail}>{data.lead.company}</Text> : null}
                  {data.lead.email ? <Text style={s.billDetail}>{data.lead.email}</Text> : null}
                  {data.lead.phone ? <Text style={s.billDetail}>{data.lead.phone}</Text> : null}
                  {data.lead.gstin ? <Text style={s.billDetail}>GSTIN: {data.lead.gstin}</Text> : null}
                  {data.lead.state ? <Text style={s.billDetail}>State: {data.lead.state}</Text> : null}
                </View>
              ) : (
                <Text style={s.billDetail}>—</Text>
              )}
            </View>
          </View>

          <View style={s.billColLast}>
            <Text style={s.billLabel}>For</Text>
            <View style={s.billBox}>
              {data.title ? (
                <Text style={[s.billName, { fontSize: 11 }]}>{data.title}</Text>
              ) : (
                <Text style={s.billDetail}>—</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── LINE ITEMS TABLE ── */}
        <View>
          <View style={s.tableHeaderRow}>
            <View style={s.descCol}>
              <Text style={s.thText}>Description</Text>
            </View>
            <Text style={[s.thText, s.qtyCol]}>Qty</Text>
            <Text style={[s.thText, s.priceCol]}>Unit Price</Text>
            <Text style={[s.thText, s.amtCol]}>Amount</Text>
          </View>

          {data.lineItems.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <View style={s.descCol}>
                <Text>{item.description}</Text>
                {item.hsn_sac ? <Text style={s.hsnText}>HSN/SAC: {item.hsn_sac}</Text> : null}
              </View>
              <Text style={[{ fontSize: 9 }, s.qtyCol]}>{String(item.quantity)}</Text>
              <Text style={[{ fontSize: 9 }, s.priceCol]}>{fmt(item.unit_price, currency)}</Text>
              <Text style={[{ fontSize: 9 }, s.amtCol]}>{fmt(item.amount, currency)}</Text>
            </View>
          ))}
        </View>

        {/* ── NOTES + TOTALS ── */}
        <View style={s.bottomSection}>
          <View style={s.notesCol}>
            <Text style={s.notesTitle}>Notes &amp; Terms</Text>
            <View style={s.notesBox}>
              {data.notes ? <Text style={s.notesText}>{data.notes}</Text> : null}
              {data.terms ? <Text style={[s.notesText, { marginTop: data.notes ? 6 : 0 }]}>{data.terms}</Text> : null}
              {!data.notes && !data.terms ? (
                <Text style={[s.notesText, { color: "#9ca3af" }]}>Payment due within 30 days of invoice date.</Text>
              ) : null}
            </View>
          </View>

          <View style={s.totalsCol}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal:</Text>
              <Text style={s.totalValue}>{fmt(data.subtotal, currency)}</Text>
            </View>
            {data.taxPercent > 0 ? (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>{taxLabel} ({data.taxPercent}%):</Text>
                <Text style={s.totalValue}>{fmt(data.taxAmount, currency)}</Text>
              </View>
            ) : null}
            {data.discount > 0 ? (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Discount:</Text>
                <Text style={s.totalValue}>- {fmt(data.discount, currency)}</Text>
              </View>
            ) : null}
            <View style={s.grandRow}>
              <Text style={s.grandLabel}>TOTAL DUE:</Text>
              <Text style={s.grandValue}>{fmt(data.total, currency)}</Text>
            </View>
          </View>
        </View>

        {/* ── PAYMENT BANNER ── */}
        {(data.org.gstin || data.org.pan) ? (
          <View style={s.paymentBanner}>
            <Text style={s.paymentBannerTitle}>Company Details</Text>
            {data.org.gstin ? <Text style={s.paymentBannerText}>GSTIN: {data.org.gstin}</Text> : null}
            {data.org.pan ? <Text style={s.paymentBannerText}>PAN: {data.org.pan}</Text> : null}
          </View>
        ) : null}

        <Text style={s.thankYou}>{footerNote}</Text>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <View style={s.footerCol}>
            <Text style={s.footerTitle}>Questions?</Text>
            {data.org.email ? <Text style={s.footerText}>Email: {data.org.email}</Text> : null}
            {data.org.phone ? <Text style={s.footerText}>Phone: {data.org.phone}</Text> : null}
          </View>
          <View style={s.footerColMid}>
            <Text style={s.footerTitle}>Company Info</Text>
            {data.org.gstin ? <Text style={s.footerText}>GST #: {data.org.gstin}</Text> : null}
            {data.org.pan ? <Text style={s.footerText}>PAN #: {data.org.pan}</Text> : null}
          </View>
          <View style={s.footerColMid}>
            <Text style={s.footerTitle}>Issued By</Text>
            <Text style={s.footerText}>{data.org.name}</Text>
            {data.org.website ? <Text style={s.footerText}>{data.org.website}</Text> : null}
          </View>
        </View>

      </Page>
    </Document>
  );
}
