// src/server/tenants.ts
import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";

export type Store = {
  id: string;
  name: string;
  primaryDomain: string;
  domains: string[];
  theme?: { logoUrl?: string; colors?: Record<string, string> };
  seo?: { title?: string; description?: string; ogImage?: string };
  status?: "active" | "paused";
};

const cache = new Map<string, { store: Store; ts: number }>();
const TTL = 60_000;

function normalizeHost(raw: string) {
  const h = (raw || "").trim().toLowerCase();
  // tira protocolo, porta e www.
  return h.replace(/^https?:\/\//, "").replace(/:\d+$/, "").replace(/^www\./, "");
}

export async function getStoreByHost(rawHost: string): Promise<Store> {
  const host = normalizeHost(rawHost || "localhost");

  // cache
  const now = Date.now();
  const hit = cache.get(host);
  if (hit && now - hit.ts < TTL) return hit.store;

  // 1) tenta domains array-contains host
  const byDomains = await adminDb
    .collection("stores")
    .where("domains", "array-contains", host)
    .limit(1)
    .get();

  let doc = byDomains.docs[0];

  // 2) se não achou, tenta primaryDomain == host
  if (!doc) {
    const byPrimary = await adminDb
      .collection("stores")
      .where("primaryDomain", "==", host)
      .limit(1)
      .get();
    doc = byPrimary.docs[0];
  }

  // 3) se ainda não achou, permitir fallback controlado por env:
  //    - localmente (NODE_ENV !== 'production')
  //    - em previews (VERCEL_ENV === 'preview')
  //    - ou quando ENABLE_FALLBACK=true
  const allowFallback =
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.ENABLE_FALLBACK === "true";

  if (!doc && allowFallback) {
    const any = await adminDb.collection("stores").limit(1).get();
    doc = any.docs[0];
  }

  if (!doc) {
    throw new Error("Loja não encontrada para host " + host);
  }

  const store = { id: doc.id, ...(doc.data() as any) } as Store;
  cache.set(host, { store, ts: now });
  return store;
}
