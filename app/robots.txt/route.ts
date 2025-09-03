import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStoreByHost } from "@/src/server/tenants";

export async function GET() {
  const host = headers().get("x-tenant-host") ?? "";
  let store;
  try { store = await getStoreByHost(host); } catch { store = { primaryDomain: host }; }
  const base = `https://${store.primaryDomain || host}`;
  const body = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
