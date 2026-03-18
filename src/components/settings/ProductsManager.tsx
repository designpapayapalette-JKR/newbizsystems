"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import type { Product } from "@/types";

function ProductDialog({ product, onDone }: { product?: Product; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    unit_price: product?.unit_price?.toString() ?? "",
    category: product?.category ?? "",
  });

  async function handleSave() {
    if (!form.name || !form.unit_price) return;
    setLoading(true);
    try {
      const data = { ...form, unit_price: parseFloat(form.unit_price) };
      if (product) await updateProduct(product.id, data);
      else await createProduct(data);
      toast.success(product ? "Product updated" : "Product created");
      setOpen(false);
      onDone();
    } catch { toast.error("Failed to save"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {product ? (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
        ) : (
          <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Product</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{product ? "Edit Product" : "New Product / Service"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Website Design" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Unit Price (₹) *</Label><Input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="0.00" /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Service" /></div>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="animate-spin h-4 w-4" />} Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsManager({ products: initial }: { products: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);

  async function handleDelete(id: string) {
    await deleteProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success("Product removed");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><ProductDialog onDone={() => router.refresh()} /></div>
      {products.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No products yet. Add your first product or service.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white border rounded-lg px-4 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{p.name}</span>
                  {p.category && <Badge variant="outline" className="text-xs">{p.category}</Badge>}
                  {!p.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>
                {p.description && <p className="text-xs text-muted-foreground truncate">{p.description}</p>}
              </div>
              <span className="font-semibold text-sm text-green-700">₹{p.unit_price.toLocaleString("en-IN")}</span>
              <ProductDialog product={p} onDone={() => router.refresh()} />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
