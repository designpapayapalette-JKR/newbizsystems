export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function fmt(amount: number | null | undefined, currency: string) {
  if (amount == null) return "";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", minimumFractionDigits: 2 }).format(amount);
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const supabase = await createServiceClient();

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`*, lead:leads(id, name, company, email, phone, gstin, pan, state, state_code), line_items:invoice_line_items(*), org:organizations(*)`)
    .eq("id", id)
    .single();

  if (error || !invoice) {
    console.error("Invoice fetch error:", error?.message, "id:", id);
    return new NextResponse("Not found", { status: 404 });
  }

  const orgRaw = invoice.org as any;
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
  const lead = invoice.lead as any;
  const lineItems = ((invoice.line_items ?? []) as any[]).sort((a, b) => a.position - b.position);

  const currency = invoice.currency || org?.currency || "INR";
  const brandColor = org?.invoice_color || "#2563eb";
  const taxLabel = org?.tax_label || "GST";

  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"};">
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.description || ""}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(item.unit_price, currency)}</td>
      ${item.discount ? `<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.discount}%</td>` : ""}
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:500;">${fmt(item.amount, currency)}</td>
    </tr>
  `).join("");

  const hasDiscount = lineItems.some((i: any) => i.discount);

  const statusColors: Record<string, string> = {
    draft: "#6b7280",
    sent: "#2563eb",
    paid: "#16a34a",
    overdue: "#dc2626",
    cancelled: "#9ca3af",
  };
  const statusColor = statusColors[invoice.status] || "#6b7280";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1f2937; background: #fff; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .brand { display: flex; flex-direction: column; gap: 4px; }
    .brand-name { font-size: 22px; font-weight: 700; color: ${brandColor}; }
    .brand-sub { font-size: 11px; color: #6b7280; line-height: 1.5; }
    .invoice-meta { text-align: right; }
    .invoice-title { font-size: 28px; font-weight: 800; color: ${brandColor}; letter-spacing: -0.5px; }
    .invoice-number { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .status-badge { display: inline-block; margin-top: 8px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #fff; background: ${statusColor}; }

    /* Divider */
    .divider { border: none; border-top: 2px solid ${brandColor}; margin: 20px 0; opacity: 0.15; }

    /* Billing section */
    .billing { display: flex; gap: 0; margin-bottom: 28px; }
    .billing-col { flex: 1; }
    .billing-col + .billing-col { border-left: 1px solid #e5e7eb; padding-left: 24px; margin-left: 24px; }
    .billing-label { font-size: 10px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .billing-name { font-size: 15px; font-weight: 700; color: #111827; }
    .billing-detail { font-size: 12px; color: #4b5563; line-height: 1.6; margin-top: 2px; }

    /* Dates */
    .dates { display: flex; gap: 32px; margin-bottom: 28px; }
    .date-item { }
    .date-label { font-size: 10px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.8px; }
    .date-value { font-size: 13px; font-weight: 600; color: #111827; margin-top: 2px; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: ${brandColor}; }
    thead th { padding: 10px 12px; text-align: left; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:not(:first-child) { text-align: center; }
    thead th:last-child { text-align: right; }

    /* Totals */
    .totals-section { display: flex; justify-content: flex-end; margin-top: 0; border-top: 2px solid ${brandColor}; padding-top: 16px; }
    .totals-table { width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; color: #374151; }
    .totals-row.grand { font-size: 16px; font-weight: 700; color: ${brandColor}; border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 4px; }

    /* Notes & Terms */
    .notes-section { margin-top: 32px; display: flex; gap: 32px; }
    .notes-col { flex: 1; }
    .notes-label { font-size: 10px; font-weight: 700; color: ${brandColor}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
    .notes-text { font-size: 12px; color: #4b5563; line-height: 1.6; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }

    @media print {
      body { background: #fff; }
      .page { padding: 20px; max-width: 100%; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="height:48px;object-fit:contain;margin-bottom:6px;" />` : ""}
        <div class="brand-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="brand-sub">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.phone ? `<div class="brand-sub">Ph: ${org.phone}</div>` : ""}
        ${org?.email ? `<div class="brand-sub">${org.email}</div>` : ""}
        ${org?.website ? `<div class="brand-sub">${org.website}</div>` : ""}
        ${org?.gstin ? `<div class="brand-sub">GSTIN: ${org.gstin}</div>` : ""}
        ${org?.pan ? `<div class="brand-sub">PAN: ${org.pan}</div>` : ""}
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoice_number}</div>
        ${invoice.title ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${invoice.title}</div>` : ""}
        <div><span class="status-badge">${invoice.status}</span></div>
      </div>
    </div>

    <hr class="divider" />

    <!-- Billing -->
    <div class="billing">
      <div class="billing-col">
        <div class="billing-label">Bill From</div>
        <div class="billing-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="billing-detail">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.gstin ? `<div class="billing-detail">GSTIN: ${org.gstin}</div>` : ""}
        ${org?.pan ? `<div class="billing-detail">PAN: ${org.pan}</div>` : ""}
        ${org?.hsn_sac ? `<div class="billing-detail">HSN/SAC: ${org.hsn_sac}</div>` : ""}
      </div>
      ${lead ? `
      <div class="billing-col">
        <div class="billing-label">Bill To</div>
        <div class="billing-name">${lead.name || ""}</div>
        ${lead.company ? `<div class="billing-detail">${lead.company}</div>` : ""}
        ${lead.email ? `<div class="billing-detail">${lead.email}</div>` : ""}
        ${lead.phone ? `<div class="billing-detail">${lead.phone}</div>` : ""}
        ${lead.state ? `<div class="billing-detail">${lead.state}${lead.state_code ? ` (${lead.state_code})` : ""}</div>` : ""}
        ${lead.gstin ? `<div class="billing-detail">GSTIN: ${lead.gstin}</div>` : ""}
        ${lead.pan ? `<div class="billing-detail">PAN: ${lead.pan}</div>` : ""}
      </div>
      ` : ""}
    </div>

    <!-- Dates -->
    <div class="dates">
      <div class="date-item">
        <div class="date-label">Issue Date</div>
        <div class="date-value">${fmtDate(invoice.issue_date)}</div>
      </div>
      ${invoice.due_date ? `
      <div class="date-item">
        <div class="date-label">Due Date</div>
        <div class="date-value">${fmtDate(invoice.due_date)}</div>
      </div>
      ` : ""}
    </div>

    <!-- Line Items -->
    <table>
      <thead>
        <tr>
          <th style="text-align:left;">Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          ${hasDiscount ? `<th style="text-align:right;">Disc.</th>` : ""}
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${fmt(invoice.subtotal, currency)}</span>
        </div>
        ${invoice.discount ? `
        <div class="totals-row">
          <span>Discount</span>
          <span>-${fmt(invoice.discount, currency)}</span>
        </div>
        ` : ""}
        ${invoice.tax_amount ? `
        <div class="totals-row">
          <span>${taxLabel}${invoice.tax_percent ? ` (${invoice.tax_percent}%)` : ""}</span>
          <span>${fmt(invoice.tax_amount, currency)}</span>
        </div>
        ` : ""}
        <div class="totals-row grand">
          <span>Total</span>
          <span>${fmt(invoice.total, currency)}</span>
        </div>
      </div>
    </div>

    <!-- Notes & Terms -->
    ${invoice.notes || invoice.terms ? `
    <div class="notes-section">
      ${invoice.notes ? `
      <div class="notes-col">
        <div class="notes-label">Notes</div>
        <div class="notes-text">${invoice.notes.replace(/\n/g, "<br/>")}</div>
      </div>
      ` : ""}
      ${invoice.terms ? `
      <div class="notes-col">
        <div class="notes-label">Terms &amp; Conditions</div>
        <div class="notes-text">${invoice.terms.replace(/\n/g, "<br/>")}</div>
      </div>
      ` : ""}
    </div>
    ` : ""}

    <!-- Footer -->
    ${org?.invoice_footer ? `
    <div class="footer">${org.invoice_footer}</div>
    ` : `<div class="footer">Thank you for your business.</div>`}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
