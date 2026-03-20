"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganization } from "@/actions/organizations";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Building2 } from "lucide-react";

interface OrgWithBranding {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  logo_url: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  invoice_color?: string | null;
  invoice_footer?: string | null;
  invoice_template?: string | null;
  gstin?: string | null;
  tax_label?: string | null;
  pan?: string | null;
  state?: string | null;
  state_code?: string | null;
  hsn_sac?: string | null;
}

export function OrgSettingsForm({ org, previewInvoiceId }: { org: OrgWithBranding; previewInvoiceId?: string | null }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [name, setName] = useState(org.name);
  const [currency, setCurrency] = useState(org.currency);
  const [timezone, setTimezone] = useState(org.timezone);
  const [address, setAddress] = useState(org.address ?? "");
  const [phone, setPhone] = useState(org.phone ?? "");
  const [email, setEmail] = useState(org.email ?? "");
  const [website, setWebsite] = useState(org.website ?? "");
  const [invoiceColor, setInvoiceColor] = useState(org.invoice_color ?? "#2563EB");
  const [invoiceFooter, setInvoiceFooter] = useState(org.invoice_footer ?? "Thank you for your business!");
  const [invoiceTemplate, setInvoiceTemplate] = useState(org.invoice_template ?? "classic");
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "");
  const [gstin, setGstin] = useState(org.gstin ?? "");
  const [taxLabel, setTaxLabel] = useState(org.tax_label ?? "GST");
  const [pan, setPan] = useState(org.pan ?? "");
  const [state, setState] = useState(org.state ?? "");
  const [stateCode, setStateCode] = useState(org.state_code ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${org.id}/logo.${ext}`;
      const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
      await updateOrganization(org.id, { logo_url: publicUrl });
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemoveLogo() {
    setLogoUrl("");
    await updateOrganization(org.id, { logo_url: null });
    toast.success("Logo removed");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOrganization(org.id, {
        name,
        currency,
        timezone,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
        invoice_color: invoiceColor,
        invoice_footer: invoiceFooter || undefined,
        gstin: gstin || undefined,
        tax_label: taxLabel,
        pan: pan || undefined,
        state: state || undefined,
        state_code: stateCode || undefined,
      });
      toast.success("Organization updated");
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader><CardTitle className="text-base">Company Logo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Appears on invoices and PDF documents. PNG or JPG, max 2MB.</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Building2 className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Logo"}
              </Button>
              {logoUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} className="gap-2 text-destructive hover:text-destructive">
                  <X className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                    <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                    <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                    <SelectItem value="AED">د.إ UAE Dirham (AED)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST, +5:30)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST, +4:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Textarea
                placeholder="123 Main Street, City, State, PIN"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Phone</Label>
                <Input placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Business Email</Label>
                <Input type="email" placeholder="hello@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input placeholder="https://yourcompany.com" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Business Location & GST */}
      <Card>
        <CardHeader><CardTitle className="text-base">Business Location & Tax Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business State (Place of Supply) *</Label>
              <Select 
                value={stateCode} 
                onValueChange={(val) => {
                  const s = INDIAN_STATES.find(x => x.code === val);
                  if (s) { setState(s.name); setStateCode(s.code); }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tax Label</Label>
              <Select value={taxLabel} onValueChange={setTaxLabel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GST">GST (India)</SelectItem>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="Tax">Tax</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>GSTIN *</Label>
              <Input placeholder="22AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input placeholder="AAAAA0000A" value={pan} onChange={(e) => setPan(e.target.value)} className="font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Branding */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice Branding</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={invoiceColor}
                onChange={(e) => setInvoiceColor(e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <Input
                value={invoiceColor}
                onChange={(e) => setInvoiceColor(e.target.value)}
                className="w-32 font-mono text-sm"
                placeholder="#2563EB"
              />
              <span className="text-xs text-muted-foreground">Used for table headers, totals, and borders in PDF</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Invoice Footer Text</Label>
            <Input
              value={invoiceFooter}
              onChange={(e) => setInvoiceFooter(e.target.value)}
              placeholder="Thank you for your business!"
            />
          </div>
          <Button
            onClick={async () => {
              setLoading(true);
              try {
                await updateOrganization(org.id, { invoice_color: invoiceColor, invoice_footer: invoiceFooter });
                toast.success("Invoice branding saved");
              } catch {
                toast.error("Failed to save");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            variant="outline"
          >
            {loading && <Loader2 className="animate-spin" />}
            Save Invoice Branding
          </Button>
        </CardContent>
      </Card>

      {/* Default Invoice Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Invoice Template</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">All new invoices will use this template by default. You can still switch templates when previewing individual invoices.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: "classic",   label: "Classic",         desc: "Branded header with colored accents",       preview: "header_bar" },
              { id: "modern",    label: "Modern Minimal",  desc: "Sleek monochrome, luxury feel",             preview: "top_stripe" },
              { id: "bold",      label: "Bold Pro",        desc: "Dark full-bleed header, high contrast",     preview: "dark_header" },
              { id: "elegant",   label: "Elegant",         desc: "Left sidebar stripe, two-tone layout",      preview: "sidebar" },
              { id: "corporate", label: "Corporate",       desc: "Professional grid layout",                  preview: "grid" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setInvoiceTemplate(t.id); setShowPreview(true); }}
                className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                  invoiceTemplate === t.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Mini preview swatch */}
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 h-16 bg-gray-50 flex flex-col justify-between p-1.5">
                  {t.preview === "header_bar" && (
                    <>
                      <div style={{ background: invoiceColor }} className="h-2 rounded-sm w-full" />
                      <div className="space-y-1">
                        <div className="bg-gray-200 h-1 rounded w-3/4" />
                        <div className="bg-gray-200 h-1 rounded w-1/2" />
                      </div>
                      <div style={{ background: invoiceColor }} className="h-1.5 rounded-sm w-2/3 ml-auto" />
                    </>
                  )}
                  {t.preview === "top_stripe" && (
                    <>
                      <div style={{ background: invoiceColor }} className="h-1 rounded-full w-full mb-1" />
                      <div className="space-y-1">
                        <div className="bg-gray-300 h-1 rounded w-1/2" />
                        <div className="bg-gray-200 h-1 rounded w-3/4" />
                      </div>
                      <div className="flex justify-end"><div style={{ borderColor: invoiceColor }} className="border-2 rounded px-2 py-0.5 w-16 h-3" /></div>
                    </>
                  )}
                  {t.preview === "dark_header" && (
                    <>
                      <div className="bg-gray-900 rounded-sm flex items-center justify-between px-1.5 py-1">
                        <div className="bg-white/60 h-1 rounded w-8" />
                        <div className="bg-white/60 h-1 rounded w-6" />
                      </div>
                      <div className="space-y-1 mt-1">
                        <div className="bg-gray-200 h-1 rounded w-3/4" />
                        <div className="bg-gray-200 h-1 rounded w-1/2" />
                      </div>
                    </>
                  )}
                  {t.preview === "sidebar" && (
                    <div className="flex h-full gap-1">
                      <div style={{ background: invoiceColor }} className="w-5 h-full rounded-sm" />
                      <div className="flex-1 space-y-1 pt-1">
                        <div className="bg-gray-300 h-1 rounded w-full" />
                        <div className="bg-gray-200 h-1 rounded w-3/4" />
                        <div className="bg-gray-200 h-1 rounded w-1/2" />
                      </div>
                    </div>
                  )}
                  {t.preview === "grid" && (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5"><div className="bg-gray-400 h-1 rounded w-10" /><div className="bg-gray-200 h-0.5 rounded w-8" /></div>
                        <div style={{ background: invoiceColor }} className="h-4 w-1 rounded" />
                      </div>
                      <div className="flex gap-1 mt-1">
                        <div className="flex-1 bg-gray-100 rounded h-4" />
                        <div className="flex-1 bg-gray-100 rounded h-4" />
                        <div className="flex-1 bg-gray-100 rounded h-4" />
                      </div>
                    </>
                  )}
                </div>
                <div className={`text-sm font-semibold ${invoiceTemplate === t.id ? "text-primary" : "text-gray-800"}`}>
                  {t.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                {invoiceTemplate === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Live invoice preview */}
          {previewInvoiceId && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowPreview(v => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                {showPreview ? "Hide" : "Show"} Live Preview
              </button>
              {showPreview && (
                <div className="mt-3 rounded-xl border overflow-hidden shadow-sm bg-white" style={{ height: "520px" }}>
                  <div className="flex items-center gap-2 justify-between px-4 py-2 bg-gray-50 border-b">
                    <span className="text-xs font-medium text-gray-500">
                      Previewing: <span className="text-gray-900 font-semibold capitalize">{invoiceTemplate}</span> template — using your most recent invoice
                    </span>
                    <a
                      href={`/api/invoices/${previewInvoiceId}/pdf?template=${invoiceTemplate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Open full screen ↗
                    </a>
                  </div>
                  <iframe
                    key={invoiceTemplate}
                    src={`/api/invoices/${previewInvoiceId}/pdf?template=${invoiceTemplate}`}
                    title={`Preview: ${invoiceTemplate}`}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                  />
                </div>
              )}
            </div>
          )}
          {!previewInvoiceId && (
            <p className="text-xs text-muted-foreground">Create your first invoice to enable live template previews.</p>
          )}
          <Button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await updateOrganization(org.id, { invoice_template: invoiceTemplate });
                toast.success(`Default template set to ${invoiceTemplate.charAt(0).toUpperCase() + invoiceTemplate.slice(1)}`);
              } catch {
                toast.error("Failed to save template");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" />}
            Set as Default Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const INDIAN_STATES = [
  { name: "Jammu & Kashmir", code: "01" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Punjab", code: "03" },
  { name: "Chandigarh", code: "04" },
  { name: "Uttarakhand", code: "05" },
  { name: "Haryana", code: "06" },
  { name: "Delhi", code: "07" },
  { name: "Rajasthan", code: "08" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Bihar", code: "10" },
  { name: "Sikkim", code: "11" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Nagaland", code: "13" },
  { name: "Manipur", code: "14" },
  { name: "Mizoram", code: "15" },
  { name: "Tripura", code: "16" },
  { name: "Meghalaya", code: "17" },
  { name: "Assam", code: "18" },
  { name: "West Bengal", code: "19" },
  { name: "Jharkhand", code: "20" },
  { name: "Odisha", code: "21" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Gujarat", code: "24" },
  { name: "Daman & Diu", code: "25" },
  { name: "Dadra & Nagar Haveli", code: "26" },
  { name: "Maharashtra", code: "27" },
  { name: "Andhra Pradesh (Old)", code: "28" },
  { name: "Karnataka", code: "29" },
  { name: "Goa", code: "30" },
  { name: "Lakshadweep", code: "31" },
  { name: "Kerala", code: "32" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Puducherry", code: "34" },
  { name: "Andaman & Nicobar Islands", code: "35" },
  { name: "Telangana", code: "36" },
  { name: "Andhra Pradesh (New)", code: "37" },
  { name: "Ladakh", code: "38" },
];
