import { getProducts } from "@/actions/products";
import { ProductsManager } from "@/components/settings/ProductsManager";

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Products &amp; Services</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage your product/service catalog. These can be linked to invoices.</p>
      <ProductsManager products={products as any} />
    </div>
  );
}
