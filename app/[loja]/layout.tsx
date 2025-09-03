import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Loja",
};

export default async function LojaLayout({ children, params }: { children: ReactNode; params: { loja: string } }) {
  const slug = params.loja;
  let store: any = null;
  try {
    const { adminDb } = await import("@/lib/firebaseAdmin");
    // tenta primaryDomain
    const byPrimary = await adminDb.collection("stores").where("primaryDomain", "==", slug).limit(1).get();
    if (byPrimary.docs[0]) {
      store = { id: byPrimary.docs[0].id, ...(byPrimary.docs[0].data() as any) };
    } else {
      // tenta domains array-contains
      const byDomains = await adminDb.collection("stores").where("domains", "array-contains", slug).limit(1).get();
      if (byDomains.docs[0]) {
        store = { id: byDomains.docs[0].id, ...(byDomains.docs[0].data() as any) };
      }
    }
  } catch (e) {
    // ignore, manter store null
    store = null;
  }

  return (
    <>
      <main className="flex-1">{children}</main>
    </>
  );
}
