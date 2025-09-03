import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStoreByHost } from "@/src/server/tenants";
import { getFeaturedProducts } from "@/src/server/products";

export async function GET() {
  const host = headers().get("x-tenant-host") ?? "";
  const store = await getStoreByHost(host);
  const base = `https://${store.primaryDomain || host}`;
  const products = await getFeaturedProducts(store.id, 100);

  const urls = [
    `${base}/`,
    `${base}/categoria/todos`,
    ...products.map((p) => `${base}/produto/${p.slug}`)
  ].map((loc) => `<url><loc>${loc}</loc></url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
