import { getStoreByHost } from "@/server/tenants";
import { headers } from "next/headers";
import ProductCard from "@/ui/ProductCard";

export default async function LojaPage({ params }: { params: { loja: string } }) {
  // ...existing code...
  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...
  // Tenta primeiro buscar pela slug do path (primaryDomain). Se não achar, usa host.
  let store: any | null = null;
  if (params.loja) {
    const { adminDb } = await import("@/lib/firebaseAdmin");
    const byPrimary = await adminDb.collection("stores").where("primaryDomain", "==", params.loja).limit(1).get();
    const doc = byPrimary.docs[0];
    if (doc) {
      store = { id: doc.id, ...(doc.data() as any) };
    }
  }

  if (!store) {
    const host = headers().get("x-tenant-host") ?? "";
    try {
      store = await getStoreByHost(host);
    } catch (err) {
      store = null;
    }
  }

  // Função auxiliar para pegar campo, tanto no raiz quanto em domains (objeto ou array)
  function getField(obj: any, field: string) {
    if (!obj) return "";
    if (obj[field]) return obj[field];
    if (Array.isArray(obj.domains)) {
      // Se domains for array, pega do primeiro objeto válido
      const found = obj.domains.find((d: any) => d[field]);
      if (found) return found[field];
    } else if (obj.domains && typeof obj.domains === "object") {
      if (obj.domains[field]) return obj.domains[field];
    }
    return "";
  }

  // Função auxiliar para pegar logo
  function getLogo(obj: any) {
    if (!obj) return "";
    if (obj.theme?.logoUrl) return obj.theme.logoUrl;
    if (obj.domains?.theme?.logoUrl) return obj.domains.theme.logoUrl;
    if (Array.isArray(obj.domains)) {
      const found = obj.domains.find((d: any) => d.theme?.logoUrl);
      if (found) return found.theme.logoUrl;
    }
    return "";
  }

  // Se não encontrar, busca pelo slug do path (primaryDomain) usando admin SDK
  if (!store || store.id === "default") {
    const { adminDb } = await import("@/lib/firebaseAdmin");
    const snap = await adminDb.collection("stores").get();
    const found = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })).find((s: any) => getField(s, "primaryDomain") === params.loja);
    store = found || null;
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold">Loja não encontrada</h1>
      </div>
    );
  }

  // Buscar produtos da loja via helper (mesma query da home)
  const { getFeaturedProducts } = await import("@/server/products");
  const produtos = await getFeaturedProducts(store.id, 24);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold">{getField(store, "name") || "Loja sem nome"}</h1>
      <p className="mt-2">Domínio principal: {getField(store, "primaryDomain")}</p>
      <p className="mt-2">Status: {getField(store, "status")}</p>
      {/* Exibir logo se existir */}
      {getLogo(store) && (
        <img src={getLogo(store)} alt="Logo da loja" style={{ maxWidth: 120, marginTop: 16 }} />
      )}

      {/* Produtos da loja (grid igual à home) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Produtos</h2>
        <p className="text-neutral-600 mt-1">Vitrine da {getField(store, "name")}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {produtos.map((p) => (
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
    </div>
  );
}
