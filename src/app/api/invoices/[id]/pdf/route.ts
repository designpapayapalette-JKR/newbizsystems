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

// ─────────────────────── TEMPLATE: CLASSIC ───────────────────────
// ─────────────────────── TEMPLATE: CLASSIC ───────────────────────
function classicTemplate(invoice: any, org: any, lead: any, lineItems: any[], currency: string, brandColor: string, taxLabel: string, lineItemsHtml: string, hasDiscount: boolean): string {
  const isINR = currency === "INR";
  const statusColors: Record<string, string> = { draft: "#6b7280", sent: "#2563eb", paid: "#16a34a", overdue: "#dc2626", cancelled: "#9ca3af" };
  const statusColor = statusColors[invoice.status] || "#6b7280";
  
  const gstBreakdownHtml = isINR && invoice.tax_amount > 0 ? `
    <div style="margin-top:12px;padding:10px;background:#f9fafb;border-radius:4px;border:1px solid #e5e7eb;">
      <div style="font-size:10px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">GST Breakdown</div>
      ${invoice.cgst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>CGST</span><span>${fmt(invoice.cgst_amount, currency)}</span></div>` : ""}
      ${invoice.sgst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>SGST</span><span>${fmt(invoice.sgst_amount, currency)}</span></div>` : ""}
      ${invoice.igst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>IGST</span><span>${fmt(invoice.igst_amount, currency)}</span></div>` : ""}
    </div>
  ` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1f2937;background:#fff;}
    .page{max-width:800px;margin:0 auto;padding:40px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;}
    .brand-name{font-size:22px;font-weight:700;color:${brandColor};}
    .brand-sub{font-size:11px;color:#6b7280;line-height:1.5;}
    .invoice-title{font-size:28px;font-weight:800;color:${brandColor};letter-spacing:-0.5px;}
    .invoice-number{font-size:13px;color:#6b7280;margin-top:4px;}
    .status-badge{display:inline-block;margin-top:8px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;color:#fff;background:${statusColor};}
    .divider{border:none;border-top:3px solid ${brandColor};margin:20px 0;}
    .billing{display:flex;gap:0;margin-bottom:28px;}
    .billing-col{flex:1;}
    .billing-col+.billing-col{border-left:1px solid #e5e7eb;padding-left:24px;margin-left:24px;}
    .billing-label{font-size:10px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
    .billing-name{font-size:15px;font-weight:700;color:#111827;}
    .billing-detail{font-size:12px;color:#4b5563;line-height:1.6;margin-top:2px;}
    .dates{display:flex;gap:32px;margin-bottom:28px;}
    .date-label{font-size:10px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:0.8px;}
    .date-value{font-size:13px;font-weight:600;color:#111827;margin-top:2px;}
    table{width:100%;border-collapse:collapse;margin-bottom:0;}
    thead tr{background:${brandColor};}
    thead th{padding:10px 12px;text-align:left;color:#fff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;}
    thead th:not(:first-child){text-align:center;}
    thead th:last-child{text-align:right;}
    .totals-section{display:flex;justify-content:flex-end;margin-top:0;border-top:2px solid ${brandColor};padding-top:16px;}
    .totals-table{width:260px;}
    .totals-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px;color:#374151;}
    .totals-row.grand{font-size:16px;font-weight:700;color:${brandColor};border-top:1px solid #e5e7eb;padding-top:8px;margin-top:4px;}
    .notes-section{margin-top:32px;display:flex;gap:32px;}
    .notes-col{flex:1;}
    .notes-label{font-size:10px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;}
    .notes-text{font-size:12px;color:#4b5563;line-height:1.6;}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af;}
    @media print{body{background:#fff;}.page{padding:20px;max-width:100%;}@page{margin:1cm;}}
  </style></head><body><div class="page">
    <div class="header">
      <div>
        ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="height:48px;object-fit:contain;margin-bottom:6px;"/>` : ""}
        <div class="brand-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="brand-sub">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.phone ? `<div class="brand-sub">Ph: ${org.phone}</div>` : ""}
        ${org?.email ? `<div class="brand-sub">${org.email}</div>` : ""}
        ${org?.gstin ? `<div class="brand-sub">GSTIN: ${org.gstin}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div class="invoice-title">${isINR ? "TAX INVOICE" : "INVOICE"}</div>
        <div class="invoice-number">#${invoice.invoice_number}</div>
        ${invoice.title ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${invoice.title}</div>` : ""}
        <div><span class="status-badge">${invoice.status}</span></div>
      </div>
    </div>
    <hr class="divider"/>
    <div class="billing">
      <div class="billing-col">
        <div class="billing-label">Bill From</div>
        <div class="billing-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="billing-detail">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.gstin ? `<div class="billing-detail">GSTIN: ${org.gstin}</div>` : ""}
        ${org?.pan ? `<div class="billing-detail">PAN: ${org.pan}</div>` : ""}
        ${org?.state ? `<div class="billing-detail">State: ${org.state} (${org.state_code || ""})</div>` : ""}
      </div>
      ${lead ? `<div class="billing-col">
        <div class="billing-label">Bill To</div>
        <div class="billing-name">${lead.name || ""}</div>
        ${lead.company ? `<div class="billing-detail">${lead.company}</div>` : ""}
        ${lead.email ? `<div class="billing-detail">${lead.email}</div>` : ""}
        ${lead.phone ? `<div class="billing-detail">${lead.phone}</div>` : ""}
        ${lead.gstin ? `<div class="billing-detail">GSTIN: ${lead.gstin}</div>` : ""}
        ${lead.state ? `<div class="billing-detail">Place of Supply: ${lead.state} (${lead.state_code || ""})</div>` : ""}
      </div>` : ""}
    </div>
    <div class="dates">
      <div><div class="date-label">Issue Date</div><div class="date-value">${fmtDate(invoice.issue_date)}</div></div>
      ${invoice.due_date ? `<div><div class="date-label">Due Date</div><div class="date-value">${fmtDate(invoice.due_date)}</div></div>` : ""}
    </div>
    <table><thead><tr>
      <th style="text-align:left;">Description</th>
      ${isINR ? `<th style="text-align:center;">HSN/SAC</th>` : ""}
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Unit Price</th>
      ${hasDiscount ? `<th style="text-align:right;">Disc.</th>` : ""}
      <th style="text-align:right;">Amount</th>
    </tr></thead><tbody>${lineItemsHtml}</tbody></table>
    <div class="totals-section"><div class="totals-table">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.subtotal, currency)}</span></div>
      ${invoice.discount ? `<div class="totals-row"><span>Discount</span><span>-${fmt(invoice.discount, currency)}</span></div>` : ""}
      <div class="totals-row" style="border-bottom:1px solid #f3f4f6;padding-bottom:8px;margin-bottom:8px;">
        <span>${taxLabel}</span><span>${fmt(invoice.tax_amount, currency)}</span>
      </div>
      ${gstBreakdownHtml}
      <div class="totals-row grand"><span>Total Amount</span><span>${fmt(invoice.total, currency)}</span></div>
    </div></div>
    ${invoice.notes || invoice.terms ? `<div class="notes-section">
      ${invoice.notes ? `<div class="notes-col"><div class="notes-label">Notes</div><div class="notes-text">${invoice.notes.replace(/\n/g, "<br/>")}</div></div>` : ""}
      ${invoice.terms ? `<div class="notes-col"><div class="notes-label">Terms &amp; Conditions</div><div class="notes-text">${invoice.terms.replace(/\n/g, "<br/>")}</div></div>` : ""}
    </div>` : ""}
    <div class="footer">${org?.invoice_footer || "Thank you for your business."}</div>
  </div></body></html>`;
}

// ─────────────────────── TEMPLATE: MODERN MINIMAL ───────────────────────
function modernMinimalTemplate(invoice: any, org: any, lead: any, lineItems: any[], currency: string, brandColor: string, taxLabel: string): string {
  const isINR = currency === "INR";
  const accent = brandColor;
  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${item.description || ""}</td>
      ${isINR ? `<td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#94a3b8;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${item.hsn_sac || "—"}</td>` : ""}
      ${isINR ? `<td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#94a3b8;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${item.tax_rate ?? 0}%</td>` : ""}
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${item.quantity ?? 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${fmt(item.unit_price, currency)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;${i % 2 !== 0 ? "background:#fafafa;" : ""}">${fmt(item.amount, currency)}</td>
    </tr>`).join("");

  const gstBreakdownHtml = isINR && invoice.tax_amount > 0 ? `
    <div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">
      <div style="font-size:10px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px;">GST Breakdown</div>
      ${invoice.cgst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>CGST</span><span>${fmt(invoice.cgst_amount, currency)}</span></div>` : ""}
      ${invoice.sgst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>SGST</span><span>${fmt(invoice.sgst_amount, currency)}</span></div>` : ""}
      ${invoice.igst_amount > 0 ? `<div class="totals-row" style="font-size:11px;"><span>IGST</span><span>${fmt(invoice.igst_amount, currency)}</span></div>` : ""}
    </div>
  ` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#0f172a;background:#fff;}
    .page{max-width:800px;margin:0 auto;padding:48px;}
    .top-bar{height:4px;background:${accent};border-radius:2px;margin-bottom:40px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;}
    .org-name{font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;}
    .org-sub{font-size:11px;color:#94a3b8;margin-top:2px;line-height:1.6;}
    .inv-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600;}
    .inv-number{font-size:24px;font-weight:800;color:${accent};margin-top:4px;}
    .status-chip{display:inline-block;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border:1.5px solid ${accent};color:${accent};margin-top:6px;}
    .meta-grid{display:flex;gap:48px;margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid #f1f5f9;}
    .meta-label{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;margin-bottom:4px;}
    .meta-value{font-size:13px;font-weight:600;color:#0f172a;}
    .billing{display:flex;gap:0;margin-bottom:36px;}
    .billing-section{flex:1;}
    .billing-section+.billing-section{margin-left:32px;padding-left:32px;border-left:1.5px solid #f1f5f9;}
    .section-heading{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600;margin-bottom:8px;}
    .client-name{font-size:15px;font-weight:700;color:#0f172a;}
    .client-detail{font-size:12px;color:#64748b;margin-top:2px;line-height:1.5;}
    table{width:100%;border-collapse:collapse;}
    thead th{padding:10px 16px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;}
    thead th:not(:first-child){text-align:center;}
    thead th:last-child{text-align:right;}
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:24px;}
    .totals-box{width:280px;}
    .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;}
    .grand-row{display:flex;justify-content:space-between;padding:12px 0;font-size:15px;font-weight:700;color:${accent};border-top:2px solid ${accent};margin-top:8px;}
    .footer{margin-top:48px;text-align:center;font-size:11px;color:#cbd5e1;letter-spacing:0.5px;}
    @media print{@page{margin:1cm;}}
  </style></head><body><div class="page">
    <div class="top-bar"></div>
    <div class="header">
      <div>
        ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="height:40px;object-fit:contain;margin-bottom:8px;display:block;"/>` : ""}
        <div class="org-name">${org?.name || ""}</div>
        ${org?.email ? `<div class="org-sub">${org.email}</div>` : ""}
        ${org?.phone ? `<div class="org-sub">${org.phone}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div class="inv-label">${isINR ? "Tax Invoice" : "Invoice"}</div>
        <div class="inv-number">${invoice.invoice_number}</div>
        ${invoice.title ? `<div style="font-size:12px;color:#64748b;margin-top:4px;">${invoice.title}</div>` : ""}
        <div><span class="status-chip">${invoice.status}</span></div>
      </div>
    </div>
    <div class="meta-grid">
      <div><div class="meta-label">Issue Date</div><div class="meta-value">${fmtDate(invoice.issue_date)}</div></div>
      ${invoice.due_date ? `<div><div class="meta-label">Due Date</div><div class="meta-value">${fmtDate(invoice.due_date)}</div></div>` : ""}
      ${org?.gstin ? `<div><div class="meta-label">GSTIN (Seller)</div><div class="meta-value">${org.gstin}</div></div>` : ""}
      ${lead?.gstin ? `<div><div class="meta-label">GSTIN (Buyer)</div><div class="meta-value">${lead.gstin}</div></div>` : ""}
    </div>
    <div class="billing">
      <div class="billing-section">
        <div class="section-heading">From</div>
        <div class="client-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="client-detail">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.pan ? `<div class="client-detail">PAN: ${org.pan}</div>` : ""}
        ${org?.state ? `<div class="client-detail">State: ${org.state} (${org.state_code || ""})</div>` : ""}
      </div>
      ${lead ? `<div class="billing-section">
        <div class="section-heading">Bill To</div>
        <div class="client-name">${lead.name || ""}</div>
        ${lead.company ? `<div class="client-detail">${lead.company}</div>` : ""}
        ${lead.email ? `<div class="client-detail">${lead.email}</div>` : ""}
        ${lead.gstin ? `<div class="client-detail">GSTIN: ${lead.gstin}</div>` : ""}
        ${lead.state ? `<div class="client-detail">Place of Supply: ${lead.state} (${lead.state_code || ""})</div>` : ""}
      </div>` : ""}
    </div>
    <thead style="background:#f8fafc;"><tr>
      <th style="padding:12px 16px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">Description</th>
      ${isINR ? `<th style="padding:12px 16px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">HSN/SAC</th>` : ""}
      ${isINR ? `<th style="padding:12px 16px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">GST %</th>` : ""}
      <th style="padding:12px 16px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">Qty</th>
      <th style="padding:12px 16px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">Unit Price</th>
      <th style="padding:12px 16px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;border-bottom:1.5px solid #e2e8f0;">Amount</th>
    </tr></thead><tbody>${lineItemsHtml}</tbody></table>
    <div class="totals-wrap"><div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>${fmt(invoice.subtotal, currency)}</span></div>
      ${invoice.discount ? `<div class="totals-row"><span>Discount</span><span>-${fmt(invoice.discount, currency)}</span></div>` : ""}
      <div class="totals-row" style="border-bottom:1px solid #f1f5f9;padding-bottom:4px;">
        <span>${taxLabel}</span><span>${fmt(invoice.tax_amount, currency)}</span>
      </div>
      ${gstBreakdownHtml}
      <div class="grand-row"><span>Total Due</span><span>${fmt(invoice.total, currency)}</span></div>
    </div></div>
    ${invoice.notes || invoice.terms ? `<div style="margin-top:32px;display:flex;gap:32px;">
      ${invoice.notes ? `<div style="flex:1;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600;margin-bottom:6px;">Notes</div><div style="font-size:12px;color:#64748b;line-height:1.7;">${invoice.notes.replace(/\n/g, "<br/>")}</div></div>` : ""}
      ${invoice.terms ? `<div style="flex:1;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600;margin-bottom:6px;">Terms</div><div style="font-size:12px;color:#64748b;line-height:1.7;">${invoice.terms.replace(/\n/g, "<br/>")}</div></div>` : ""}
    </div>` : ""}
    <div class="footer">${org?.invoice_footer || "Thank you for your business."}</div>
  </div></body></html>`;
}

// ─────────────────────── TEMPLATE: BOLD PRO ───────────────────────
function boldProTemplate(invoice: any, org: any, lead: any, lineItems: any[], currency: string, brandColor: string, taxLabel: string): string {
  const isINR = currency === "INR";
  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr style="${i % 2 !== 0 ? "background:#f8fafc;" : ""}">
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">${item.description || ""}</td>
      ${isINR ? `<td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;color:#64748b;">${item.hsn_sac || "—"}</td>` : ""}
      ${isINR ? `<td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;color:#64748b;">${item.tax_rate ?? 0}%</td>` : ""}
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(item.unit_price, currency)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">${fmt(item.amount, currency)}</td>
    </tr>`).join("");

  const gstBreakdownHtml = isINR && invoice.tax_amount > 0 ? `
    <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.05);border-radius:6px;border:1px solid rgba(255,255,255,0.1);margin-bottom:12px;">
      <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:4px;">GST Breakdown</div>
      ${invoice.cgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;color:#fff;"><span>CGST</span><span>${fmt(invoice.cgst_amount, currency)}</span></div>` : ""}
      ${invoice.sgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;color:#fff;"><span>SGST</span><span>${fmt(invoice.sgst_amount, currency)}</span></div>` : ""}
      ${invoice.igst_amount > 0 ? `<div class="tot-row" style="font-size:11px;color:#fff;"><span>IGST</span><span>${fmt(invoice.igst_amount, currency)}</span></div>` : ""}
    </div>
  ` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#111827;background:#fff;}
    .hero{background:${brandColor};color:#fff;padding:36px 48px;display:flex;justify-content:space-between;align-items:flex-end;}
    .org-name{font-size:24px;font-weight:800;letter-spacing:-0.5px;}
    .org-sub{font-size:11px;opacity:0.75;margin-top:3px;line-height:1.6;}
    .inv-word{font-size:40px;font-weight:900;letter-spacing:-1px;line-height:1;opacity:0.15;position:absolute;right:48px;top:24px;}
    .inv-number-box{text-align:right;}
    .inv-num-label{font-size:9px;text-transform:uppercase;letter-spacing:2px;opacity:0.7;font-weight:600;}
    .inv-num{font-size:18px;font-weight:800;margin-top:2px;}
    .inv-date{font-size:11px;opacity:0.7;margin-top:4px;}
    .status-chip{display:inline-block;margin-top:6px;padding:2px 10px;border-radius:3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:rgba(255,255,255,0.2);}
    .content{padding:40px 48px;}
    .billing-strip{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;display:flex;gap:0;margin-bottom:32px;}
    .billing-col{flex:1;}
    .billing-col+.billing-col{margin-left:24px;padding-left:24px;border-left:1px solid #e5e7eb;}
    .billing-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${brandColor};margin-bottom:6px;}
    .billing-name{font-size:14px;font-weight:700;color:#0f172a;}
    .billing-detail{font-size:12px;color:#475569;margin-top:2px;line-height:1.5;}
    .dates-row{display:flex;gap:32px;margin-bottom:24px;}
    .date-pill{background:${brandColor}15;border:1px solid ${brandColor}30;border-radius:6px;padding:8px 14px;}
    .date-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${brandColor};}
    .date-val{font-size:14px;font-weight:700;color:#0f172a;margin-top:2px;}
    table{width:100%;border-collapse:collapse;}
    thead tr{background:#111827;}
    thead th{padding:11px 16px;text-align:left;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
    thead th:not(:first-child){text-align:center;}
    thead th:last-child{text-align:right;}
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:24px;}
    .totals-inner{width:320px;background:#111827;border-radius:8px;padding:20px 24px;}
    .tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:rgba(255,255,255,0.7);}
    .grand{display:flex;justify-content:space-between;padding-top:12px;margin-top:8px;border-top:1px solid rgba(255,255,255,0.2);font-size:18px;font-weight:800;color:#fff;}
    .notes-section{margin-top:32px;display:flex;gap:32px;}
    .notes-col{flex:1;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;}
    .notes-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${brandColor};margin-bottom:6px;}
    .notes-txt{font-size:12px;color:#475569;line-height:1.7;}
    .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:40px;padding-top:16px;border-top:1px solid #f1f5f9;}
    @media print{@page{margin:0;}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.totals-inner{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style></head><body>
    <div class="hero" style="position:relative;">
      <div class="inv-word">${isINR ? "TAX INVOICE" : "INVOICE"}</div>
      <div>
        ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="height:36px;object-fit:contain;filter:brightness(0)invert(1);margin-bottom:8px;display:block;"/>` : ""}
        <div class="org-name">${org?.name || ""}</div>
        ${org?.email ? `<div class="org-sub">${org.email}</div>` : ""}
        ${org?.phone ? `<div class="org-sub">${org.phone}</div>` : ""}
        ${org?.gstin ? `<div class="org-sub">GSTIN: ${org.gstin}</div>` : ""}
      </div>
      <div class="inv-number-box">
        <div class="inv-num-label">${isINR ? "Tax Invoice" : "Invoice"} No.</div>
        <div class="inv-num">#${invoice.invoice_number}</div>
        ${invoice.title ? `<div class="inv-date">${invoice.title}</div>` : ""}
        <div class="inv-date">${fmtDate(invoice.issue_date)}</div>
        <div><span class="status-chip">${invoice.status}</span></div>
      </div>
    </div>
    <div class="content">
      <div class="billing-strip">
        <div class="billing-col">
          <div class="billing-label">From</div>
          <div class="billing-name">${org?.name || ""}</div>
          ${org?.address ? `<div class="billing-detail">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
          ${org?.pan ? `<div class="billing-detail">PAN: ${org.pan}</div>` : ""}
          ${org?.state ? `<div class="billing-detail">State: ${org.state} (${org.state_code || ""})</div>` : ""}
        </div>
        ${lead ? `<div class="billing-col">
          <div class="billing-label">Bill To</div>
          <div class="billing-name">${lead.name || ""}</div>
          ${lead.company ? `<div class="billing-detail">${lead.company}</div>` : ""}
          ${lead.gstin ? `<div class="billing-detail">GSTIN: ${lead.gstin}</div>` : ""}
          ${lead.state ? `<div class="billing-detail">Place of Supply: ${lead.state} (${lead.state_code || ""})</div>` : ""}
        </div>` : ""}
      </div>
      <div class="dates-row">
        <div class="date-pill"><div class="date-label">Issue Date</div><div class="date-val">${fmtDate(invoice.issue_date)}</div></div>
        ${invoice.due_date ? `<div class="date-pill"><div class="date-label">Due Date</div><div class="date-val">${fmtDate(invoice.due_date)}</div></div>` : ""}
      </div>
      <table><thead><tr>
        <th style="padding:11px 16px;text-align:left;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</th>
        ${isINR ? `<th style="padding:11px 16px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">HSN/SAC</th>` : ""}
        ${isINR ? `<th style="padding:11px 16px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">GST %</th>` : ""}
        <th style="padding:11px 16px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
        <th style="padding:11px 16px;text-align:right;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Unit Price</th>
        <th style="padding:11px 16px;text-align:right;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Amount</th>
      </tr></thead><tbody>${lineItemsHtml}</tbody></table>
      <div class="totals-wrap"><div class="totals-inner">
        <div class="tot-row"><span>Subtotal</span><span>${fmt(invoice.subtotal, currency)}</span></div>
        ${invoice.discount ? `<div class="tot-row"><span>Discount</span><span>-${fmt(invoice.discount, currency)}</span></div>` : ""}
        <div class="tot-row" style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:5px;margin-bottom:5px;">
          <span>${taxLabel}</span><span>${fmt(invoice.tax_amount, currency)}</span>
        </div>
        ${gstBreakdownHtml}
        <div class="grand"><span>Total Amount</span><span>${fmt(invoice.total, currency)}</span></div>
      </div></div>
      ${invoice.notes || invoice.terms ? `<div class="notes-section">
        ${invoice.notes ? `<div class="notes-col"><div class="notes-lbl">Notes</div><div class="notes-txt">${invoice.notes.replace(/\n/g, "<br/>")}</div></div>` : ""}
        ${invoice.terms ? `<div class="notes-col"><div class="notes-lbl">Terms</div><div class="notes-txt">${invoice.terms.replace(/\n/g, "<br/>")}</div></div>` : ""}
      </div>` : ""}
      <div class="footer">${org?.invoice_footer || "Thank you for your business."}</div>
    </div>
  </body></html>`;
}

// ─────────────────────── TEMPLATE: ELEGANT ───────────────────────
function elegantTemplate(invoice: any, org: any, lead: any, lineItems: any[], currency: string, brandColor: string, taxLabel: string): string {
  const isINR = currency === "INR";
  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;${i % 2 !== 0 ? "color:#6b7280;" : ""}">${item.description || ""}</td>
      ${isINR ? `<td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#9ca3af;">${item.hsn_sac || "—"}</td>` : ""}
      ${isINR ? `<td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#9ca3af;">${item.tax_rate ?? 0}%</td>` : ""}
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;${i % 2 !== 0 ? "color:#6b7280;" : ""}">${item.quantity ?? 1}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;${i % 2 !== 0 ? "color:#6b7280;" : ""}">${fmt(item.unit_price, currency)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${fmt(item.amount, currency)}</td>
    </tr>`).join("");

  const gstBreakdownHtml = isINR && invoice.tax_amount > 0 ? `
    <div style="margin-top:12px;padding:12px;border:1px solid #e5e7eb;border-radius:4px;background:#f9fafb;">
      <div style="font-size:9px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;font-family:'Segoe UI',sans-serif;">GST Breakdown</div>
      ${invoice.cgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;"><span>CGST</span><span>${fmt(invoice.cgst_amount, currency)}</span></div>` : ""}
      ${invoice.sgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;"><span>SGST</span><span>${fmt(invoice.sgst_amount, currency)}</span></div>` : ""}
      ${invoice.igst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;"><span>IGST</span><span>${fmt(invoice.igst_amount, currency)}</span></div>` : ""}
    </div>
  ` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#1a1a2e;background:#fff;}
    .wrap{display:flex;min-height:100vh;}
    .sidebar{width:220px;background:${brandColor};padding:40px 28px;flex-shrink:0;display:flex;flex-direction:column;}
    .sidebar-logo{color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;margin-bottom:4px;}
    .sidebar-sub{color:rgba(255,255,255,0.65);font-size:10px;line-height:1.6;}
    .sidebar-divider{border:none;border-top:1px solid rgba(255,255,255,0.2);margin:24px 0;}
    .sidebar-section-label{color:rgba(255,255,255,0.6);font-size:9px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:8px;font-family:'Segoe UI',sans-serif;}
    .sidebar-value{color:#fff;font-size:12px;line-height:1.6;}
    .sidebar-name{color:#fff;font-size:13px;font-weight:700;margin-bottom:2px;}
    .inv-stat{display:inline-block;margin-top:16px;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,0.2);color:#fff;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-family:'Segoe UI',sans-serif;}
    .main{flex:1;padding:40px 48px;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;border-bottom:2px solid ${brandColor};padding-bottom:24px;}
    .inv-word{font-size:36px;font-weight:700;color:${brandColor};letter-spacing:2px;}
    .inv-num{font-size:14px;color:#6b7280;margin-top:4px;font-family:'Segoe UI',sans-serif;}
    .meta-row{display:flex;gap:32px;margin-bottom:32px;}
    .meta-item{border-left:3px solid ${brandColor};padding-left:10px;}
    .meta-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;font-family:'Segoe UI',sans-serif;margin-bottom:3px;}
    .meta-val{font-size:13px;font-weight:600;color:#0f172a;font-family:'Segoe UI',sans-serif;}
    table{width:100%;border-collapse:collapse;font-family:'Segoe UI',sans-serif;}
    thead th{padding:10px 0;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};}
    thead th:not(:first-child){text-align:center;}
    thead th:last-child{text-align:right;}
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:24px;}
    .totals-box{width:260px;font-family:'Segoe UI',sans-serif;}
    .tot-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;border-bottom:1px dashed #e5e7eb;}
    .sum-row{display:flex;justify-content:space-between;padding:14px 0;font-size:16px;font-weight:700;color:${brandColor};}
    .notes-section{margin-top:36px;font-family:'Segoe UI',sans-serif;}
    .notes-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;margin-bottom:6px;}
    .notes-txt{font-size:12px;color:#475569;line-height:1.7;}
    .footer{margin-top:40px;font-family:'Segoe UI',sans-serif;font-style:italic;font-size:11px;color:#94a3b8;text-align:center;}
    @media print{@page{margin:0;}.sidebar{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style></head><body><div class="wrap">
    <div class="sidebar">
      ${org?.logo_url ? `<img src="${org.logo_url}" alt="${org.name}" style="height:36px;object-fit:contain;filter:brightness(0)invert(1);margin-bottom:12px;"/>` : ""}
      <div class="sidebar-logo">${org?.name || ""}</div>
      ${org?.email ? `<div class="sidebar-sub">${org.email}</div>` : ""}
      ${org?.phone ? `<div class="sidebar-sub">${org.phone}</div>` : ""}
      ${org?.website ? `<div class="sidebar-sub">${org.website}</div>` : ""}
      <hr class="sidebar-divider"/>
      ${org?.address ? `<div class="sidebar-section-label">Address</div><div class="sidebar-value">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
      ${org?.gstin ? `<div class="sidebar-section-label" style="margin-top:16px;">GSTIN</div><div class="sidebar-value">${org.gstin}</div>` : ""}
      ${org?.pan ? `<div class="sidebar-section-label" style="margin-top:16px;">PAN</div><div class="sidebar-value">${org.pan}</div>` : ""}
      ${org?.state ? `<div class="sidebar-section-label" style="margin-top:16px;">State</div><div class="sidebar-value">${org.state} (${org.state_code || ""})</div>` : ""}
      ${lead ? `<hr class="sidebar-divider"/>
      <div class="sidebar-section-label">Bill To</div>
      <div class="sidebar-name">${lead.name || ""}</div>
      ${lead.company ? `<div class="sidebar-value">${lead.company}</div>` : ""}
      ${lead.gstin ? `<div class="sidebar-value">GSTIN: ${lead.gstin}</div>` : ""}
      ${lead.state ? `<div class="sidebar-section-label" style="margin-top:16px;">Place of Supply</div><div class="sidebar-value">${lead.state} (${lead.state_code || ""})</div>` : ""}` : ""}
      <div class="inv-stat">${invoice.status}</div>
    </div>
    <div class="main">
      <div class="top">
        <div>
          <div class="inv-word">${isINR ? "TAX INVOICE" : "INVOICE"}</div>
          <div class="inv-num">#${invoice.invoice_number}${invoice.title ? ` — ${invoice.title}` : ""}</div>
        </div>
      </div>
      <div class="meta-row">
        <div class="meta-item"><div class="meta-lbl">Issue Date</div><div class="meta-val">${fmtDate(invoice.issue_date)}</div></div>
        ${invoice.due_date ? `<div class="meta-item"><div class="meta-lbl">Due Date</div><div class="meta-val">${fmtDate(invoice.due_date)}</div></div>` : ""}
      </div>
      <table><thead><tr>
        <th style="padding:10px 0;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">Description</th>
        ${isINR ? `<th style="padding:10px 0;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">HSN/SAC</th>` : ""}
        ${isINR ? `<th style="padding:10px 0;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">GST %</th>` : ""}
        <th style="padding:10px 0;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">Qty</th>
        <th style="padding:10px 0;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">Rate</th>
        <th style="padding:10px 0;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6b7280;font-weight:700;border-bottom:2px solid ${brandColor};">Amount</th>
      </tr></thead><tbody>${lineItemsHtml}</tbody></table>
      <div class="totals-wrap"><div class="totals-box">
        <div class="tot-row"><span>Subtotal</span><span>${fmt(invoice.subtotal, currency)}</span></div>
        ${invoice.discount ? `<div class="tot-row"><span>Discount</span><span>-${fmt(invoice.discount, currency)}</span></div>` : ""}
        <div class="tot-row">
          <span>${taxLabel}</span><span>${fmt(invoice.tax_amount, currency)}</span>
        </div>
        ${gstBreakdownHtml}
        <div class="sum-row"><span>Total Due</span><span>${fmt(invoice.total, currency)}</span></div>
      </div></div>
      ${invoice.notes || invoice.terms ? `<div class="notes-section">
        <div style="display:flex;gap:32px;">
          ${invoice.notes ? `<div style="flex:1;"><div class="notes-lbl">Notes</div><div class="notes-txt">${invoice.notes.replace(/\n/g, "<br/>")}</div></div>` : ""}
          ${invoice.terms ? `<div style="flex:1;"><div class="notes-lbl">Terms</div><div class="notes-txt">${invoice.terms.replace(/\n/g, "<br/>")}</div></div>` : ""}
        </div>
      </div>` : ""}
      <div class="footer">${org?.invoice_footer || "Thank you for your business."}</div>
    </div>
  </div></body></html>`;
}

// ─────────────────────── TEMPLATE: CORPORATE ───────────────────────
function corporateTemplate(invoice: any, org: any, lead: any, lineItems: any[], currency: string, brandColor: string, taxLabel: string): string {
  const isINR = currency === "INR";
  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr style="background:${i % 2 !== 0 ? "#f8fafc" : "#fff"};">
      <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;">${item.description || ""}</td>
      ${isINR ? `<td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;">${item.hsn_sac || "—"}</td>` : ""}
      ${isINR ? `<td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;">${item.tax_rate ?? 0}%</td>` : ""}
      <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;text-align:right;">${fmt(item.unit_price, currency)}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${fmt(item.amount, currency)}</td>
    </tr>`).join("");

  const gstBreakdownHtml = isINR && invoice.tax_amount > 0 ? `
    <div style="padding:10px 16px;background:#f8fafc;border-bottom:1px solid #f1f5f9;">
      <div style="font-size:9px;font-weight:700;color:${brandColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;border-bottom:1px solid #f1f5f9;padding-bottom:4px;font-family:'Segoe UI',sans-serif;">GST Breakdown</div>
      ${invoice.cgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;padding:2px 0;"><span>CGST</span><span>${fmt(invoice.cgst_amount, currency)}</span></div>` : ""}
      ${invoice.sgst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;padding:2px 0;"><span>SGST</span><span>${fmt(invoice.sgst_amount, currency)}</span></div>` : ""}
      ${invoice.igst_amount > 0 ? `<div class="tot-row" style="font-size:11px;border:none;padding:2px 0;"><span>IGST</span><span>${fmt(invoice.igst_amount, currency)}</span></div>` : ""}
    </div>
  ` : "";

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invoice.invoice_number}</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#334155;background:#fff;}
    .page{max-width:800px;margin:0 auto;}
    .header-band{background:${brandColor};padding:0 48px;height:8px;}
    .header-content{padding:32px 48px 0;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #e2e8f0;padding-bottom:28px;margin-bottom:28px;}
    .org-block{display:flex;align-items:center;gap:16px;}
    .org-logo{height:48px;object-fit:contain;}
    .org-name{font-size:18px;font-weight:700;color:#0f172a;}
    .org-sub{font-size:11px;color:#64748b;margin-top:2px;line-height:1.5;}
    .inv-block{text-align:right;}
    .inv-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600;}
    .inv-no{font-size:22px;font-weight:800;color:#0f172a;}
    .inv-title{font-size:12px;color:#64748b;margin-top:3px;}
    .status-tag{display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-top:6px;background:${brandColor}15;color:${brandColor};border:1px solid ${brandColor}40;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;padding:0 48px;margin-bottom:28px;}
    .info-cell{padding:16px;background:#f8fafc;border:1px solid #e2e8f0;}
    .info-cell:first-child{border-radius:6px 0 0 6px;}
    .info-cell:last-child{border-radius:0 6px 6px 0;}
    .info-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;font-weight:600;margin-bottom:4px;}
    .info-val{font-size:13px;font-weight:600;color:#0f172a;}
    .billing{display:flex;gap:24px;padding:0 48px;margin-bottom:28px;}
    .bill-box{flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:16px;}
    .bill-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:${brandColor};font-weight:700;margin-bottom:8px;}
    .bill-name{font-size:14px;font-weight:700;color:#0f172a;}
    .bill-detail{font-size:12px;color:#64748b;margin-top:2px;line-height:1.5;}
    .table-wrap{padding:0 48px;margin-bottom:0;}
    table{width:100%;border-collapse:collapse;border-radius:6px;overflow:hidden;}
    thead tr{background:#1e293b;}
    thead th{padding:11px 14px;text-align:left;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
    thead th:not(:first-child){text-align:center;}
    thead th:last-child{text-align:right;}
    .totals-wrap{display:flex;justify-content:flex-end;margin-top:24px;padding:0 48px;}
    .totals-box{width:280px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;}
    .tot-row{display:flex;justify-content:space-between;padding:10px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;}
    .grand-row{display:flex;justify-content:space-between;padding:14px 16px;font-size:16px;font-weight:800;color:#fff;background:${brandColor};}
    .notes-section{margin:28px 48px 0;display:flex;gap:24px;}
    .notes-col{flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:16px;}
    .notes-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${brandColor};margin-bottom:6px;}
    .notes-txt{font-size:12px;color:#475569;line-height:1.7;}
    .footer{margin:32px 48px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8;}
    .footer-right{text-align:right;}
    @media print{@page{margin:0.5cm;}.header-band{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.grand-row{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style></head><body><div class="page">
    <div class="header-band"></div>
    <div class="header-content">
      <div class="org-block">
        ${org?.logo_url ? `<img src="${org.logo_url}" class="org-logo" alt="${org.name}"/>` : ""}
        <div>
          <div class="org-name">${org?.name || ""}</div>
          ${org?.email ? `<div class="org-sub">${org.email}</div>` : ""}
          ${org?.phone ? `<div class="org-sub">${org.phone}</div>` : ""}
          ${org?.website ? `<div class="org-sub">${org.website}</div>` : ""}
        </div>
      </div>
      <div class="inv-block">
        <div class="inv-label">${isINR ? "Tax Invoice" : "Invoice"}</div>
        <div class="inv-no">#${invoice.invoice_number}</div>
        ${invoice.title ? `<div class="inv-title">${invoice.title}</div>` : ""}
        <div><span class="status-tag">${invoice.status}</span></div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-cell"><div class="info-lbl">Issue Date</div><div class="info-val">${fmtDate(invoice.issue_date)}</div></div>
      <div class="info-cell" style="border-left:none;"><div class="info-lbl">Due Date</div><div class="info-val">${invoice.due_date ? fmtDate(invoice.due_date) : "—"}</div></div>
      <div class="info-cell" style="border-left:none;"><div class="info-lbl">Place of Supply</div><div class="info-val">${lead?.state || "Inter-State"} (${lead?.state_code || ""})</div></div>
    </div>
    <div class="billing">
      <div class="bill-box">
        <div class="bill-lbl">From</div>
        <div class="bill-name">${org?.name || ""}</div>
        ${org?.address ? `<div class="bill-detail">${org.address.replace(/\n/g, "<br/>")}</div>` : ""}
        ${org?.gstin ? `<div class="bill-detail">GSTIN: ${org.gstin}</div>` : ""}
        ${org?.pan ? `<div class="bill-detail">PAN: ${org.pan}</div>` : ""}
        ${org?.state ? `<div class="bill-detail">State: ${org.state} (${org.state_code || ""})</div>` : ""}
      </div>
      ${lead ? `<div class="bill-box">
        <div class="bill-lbl">Bill To</div>
        <div class="bill-name">${lead.name || ""}</div>
        ${lead.company ? `<div class="bill-detail">${lead.company}</div>` : ""}
        ${lead.gstin ? `<div class="bill-detail">GSTIN: ${lead.gstin}</div>` : ""}
        ${lead.state ? `<div class="bill-detail">State: ${lead.state} (${lead.state_code || ""})</div>` : ""}
      </div>` : ""}
    </div>
    <div class="table-wrap"><table><thead><tr style="background:#1e293b;">
      <th style="padding:11px 14px;text-align:left;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</th>
      ${isINR ? `<th style="padding:11px 14px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">HSN/SAC</th>` : ""}
      ${isINR ? `<th style="padding:11px 14px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">GST %</th>` : ""}
      <th style="padding:11px 14px;text-align:center;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
      <th style="padding:11px 14px;text-align:right;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Unit Price</th>
      <th style="padding:11px 14px;text-align:right;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Amount</th>
    </tr></thead><tbody>${lineItemsHtml}</tbody></table></div>
    <div class="totals-wrap"><div class="totals-box">
      <div class="tot-row"><span>Subtotal</span><span>${fmt(invoice.subtotal, currency)}</span></div>
      ${invoice.discount ? `<div class="tot-row"><span>Discount</span><span>-${fmt(invoice.discount, currency)}</span></div>` : ""}
      <div class="tot-row">
        <span>${taxLabel}</span><span>${fmt(invoice.tax_amount, currency)}</span>
      </div>
      ${gstBreakdownHtml}
      <div class="grand-row"><span>Total Amount</span><span>${fmt(invoice.total, currency)}</span></div>
    </div></div>
    ${invoice.notes || invoice.terms ? `<div class="notes-section">
      ${invoice.notes ? `<div class="notes-col"><div class="notes-lbl">Notes</div><div class="notes-txt">${invoice.notes.replace(/\n/g, "<br/>")}</div></div>` : ""}
      ${invoice.terms ? `<div class="notes-col"><div class="notes-lbl">Terms &amp; Conditions</div><div class="notes-txt">${invoice.terms.replace(/\n/g, "<br/>")}</div></div>` : ""}
    </div>` : ""}
    <div class="footer">
      <div>${org?.gstin ? `GSTIN: ${org.gstin}` : ""}${org?.pan ? ` &nbsp;|&nbsp; PAN: ${org.pan}` : ""}</div>
      <div class="footer-right">${org?.invoice_footer || "Thank you for your business."}</div>
    </div>
  </div></body></html>`;
}

// ─────────────────────── MAIN HANDLER ───────────────────────
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
    .maybeSingle();

  if (error || !invoice) {
    return new NextResponse("Not found", { status: 404 });
  }

  const orgRaw = invoice.org as any;
  const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
  const lead = invoice.lead as any;
  const lineItems = ((invoice.line_items ?? []) as any[]).sort((a, b) => a.position - b.position);

  // Determine template to use: Query Param > Org Default > Classic fallback
  const template = req.nextUrl.searchParams.get("template") || org?.invoice_template || "classic";

  const currency = invoice.currency || org?.currency || "INR";
  const brandColor = org?.invoice_color || "#2563eb";
  const taxLabel = org?.tax_label || "GST";

  const hasDiscount = lineItems.some((i: any) => i.discount);
  const isINR = currency === "INR";
  const lineItemsHtml = lineItems.map((item: any, i: number) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"};">
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.description || ""}</td>
      ${isINR ? `<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${item.hsn_sac || "—"}</td>` : ""}
      ${isINR ? `<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${item.tax_rate ?? 0}%</td>` : ""}
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(item.unit_price, currency)}</td>
      ${hasDiscount ? `<td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.discount}%</td>` : ""}
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:500;">${fmt(item.amount, currency)}</td>
    </tr>`).join("");

  let html = "";
  if (template === "modern") {
    html = modernMinimalTemplate(invoice, org, lead, lineItems, currency, brandColor, taxLabel);
  } else if (template === "bold") {
    html = boldProTemplate(invoice, org, lead, lineItems, currency, brandColor, taxLabel);
  } else if (template === "elegant") {
    html = elegantTemplate(invoice, org, lead, lineItems, currency, brandColor, taxLabel);
  } else if (template === "corporate") {
    html = corporateTemplate(invoice, org, lead, lineItems, currency, brandColor, taxLabel);
  } else {
    html = classicTemplate(invoice, org, lead, lineItems, currency, brandColor, taxLabel, lineItemsHtml, hasDiscount);
  }

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
