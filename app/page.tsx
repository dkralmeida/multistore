import { headers } from "next/headers";
import { getStoreByHost } from "@/server/tenants";
import { getFeaturedProducts } from "@/server/products";
import ProductCard from "@/ui/ProductCard";

export default async function HomePage() {
  const host = headers().get("x-tenant-host") ?? "";
  const store = await getStoreByHost(host);
  const products = await getFeaturedProducts(store.id, 12);

  return (
    <div className="max-w-6xl mx-auto container-px py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            title={p.title}
            image={p.images?.[0] || "/placeholder.png"}
            excerpt={p.excerpt}
            affiliateUrl={p.affiliate?.url}
            networkLabel={`Comprar no parceiro`}
          />
        ))}
      </div>
    </div>
  );
}
