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
  gstin?: string | null;
  tax_label?: string | null;
  pan?: string | null;
  hsn_sac?: string | null;
}

export function OrgSettingsForm({ org }: { org: OrgWithBranding }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(org.name);
  const [currency, setCurrency] = useState(org.currency);
  const [timezone, setTimezone] = useState(org.timezone);
  const [address, setAddress] = useState(org.address ?? "");
  const [phone, setPhone] = useState(org.phone ?? "");
  const [email, setEmail] = useState(org.email ?? "");
  const [website, setWebsite] = useState(org.website ?? "");
  const [invoiceColor, setInvoiceColor] = useState(org.invoice_color ?? "#2563EB");
  const [invoiceFooter, setInvoiceFooter] = useState(org.invoice_footer ?? "Thank you for your business!");
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "");
  const [gstin, setGstin] = useState(org.gstin ?? "");
  const [taxLabel, setTaxLabel] = useState(org.tax_label ?? "GST");
  const [pan, setPan] = useState(org.pan ?? "");
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

      {/* Tax & GST Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tax & GST Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input placeholder="22AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>PAN</Label>
            <Input placeholder="AAAAA0000A" value={pan} onChange={(e) => setPan(e.target.value)} className="font-mono" />
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
    </div>
  );
}
