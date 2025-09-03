import { headers } from "next/headers";
import { getStoreByHost } from "@/server/tenants";
import { getProductBySlug } from "@/server/products";
import Lightbox from "@/ui/Lightbox";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

async function ProductContent({ slug }: { slug: string }) {
  const host = headers().get("x-tenant-host") ?? "";
  const store = await getStoreByHost(host);
  const product = await getProductBySlug(store.id, slug);
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto container-px py-10">
        <h1 className="text-xl font-semibold">Produto não encontrado</h1>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto container-px py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Galeria */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full aspect-square overflow-hidden rounded-lg border bg-white">
          <Image
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images?.slice(1, 9).map((img: string) => (
            <div key={img} className="relative aspect-square overflow-hidden rounded border bg-white">
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.title}</h1>
        {product.excerpt && <p className="text-neutral-600 mt-2">{product.excerpt}</p>}

        {product.specs && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(product.specs).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-semibold capitalize">{k}:</span>
                <span className="text-neutral-700">{String(v)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <a
            href={product.affiliate?.url}
            target="_blank"
            rel="nofollow sponsored"
            className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition"
          >
            Comprar no site parceiro
          </a>
          <p className="text-xs text-neutral-500 mt-2">
            Preços e disponibilidade podem mudar a qualquer momento no site parceiro.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense>
      {/* @ts-expect-error Async Server Component */}
      <ProductContent slug={params.slug} />
    </Suspense>
  );
}
