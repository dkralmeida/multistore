import { headers } from "next/headers";
import { getStoreByHost } from "@/server/tenants";
import { getCategoryBySlug } from "@/server/categories";
import { getProductsByCategory } from "@/server/products";
import ProductCard from "@/ui/ProductCard";
import Link from "next/link";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const host = headers().get("x-tenant-host") ?? "";
  const store = await getStoreByHost(host);

  if (params.slug === "todos") {
    return (
      <div className="max-w-6xl mx-auto container-px py-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="mt-2 text-neutral-600">Em breve: listar categorias desta loja.</p>
      </div>
    );
  }

  const category = await getCategoryBySlug(store.id, params.slug);
  if (!category) {
    return (
      <div className="max-w-6xl mx-auto container-px py-10">
        <h1 className="text-xl font-semibold">Categoria não encontrada</h1>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }
  const products = await getProductsByCategory(store.id, category.id);

  return (
    <div className="max-w-6xl mx-auto container-px py-10">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{category.name}</h1>
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
