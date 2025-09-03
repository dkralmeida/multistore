import "server-only";
import { adminDb } from "@/lib/firebaseAdmin";

export type Category = {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  parentId?: string;
  order?: number;
};

export async function getCategoriesByStore(storeId: string): Promise<Category[]> {
  const snap = await adminDb
    .collection("categories")
    .where("storeId", "==", storeId)
    .orderBy("order", "asc")
    .get();
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function getCategoryBySlug(storeId: string, slug: string): Promise<Category | null> {
  const snap = await adminDb
    .collection("categories")
    .where("storeId", "==", storeId)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) };
}
