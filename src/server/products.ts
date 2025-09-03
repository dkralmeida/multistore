import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";

export type Product = {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  images: string[];
  excerpt?: string;
  specs?: Record<string, any>;
  priceVisible?: boolean;
  price?: number;
  affiliate: { network: string; url: string };
  categoryIds: string[];
  status: "active" | "draft";
};

export async function getFeaturedProducts(storeId: string, limit: number = 12): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("storeId", "==", storeId)
    .where("status", "==", "active")
    .limit(limit)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getProductsByCategory(storeId: string, categoryId: string, limit = 24): Promise<Product[]> {
  const snap = await adminDb
    .collection("products")
    .where("storeId", "==", storeId)
    .where("status", "==", "active")
    .where("categoryIds", "array-contains", categoryId)
    .limit(limit)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
  const snap = await adminDb
    .collection("products")
    .where("storeId", "==", storeId)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) };
}
