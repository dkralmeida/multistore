import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });
  const byPrimary = await adminDb.collection("stores").where("primaryDomain", "==", slug).limit(1).get();
  if (byPrimary.docs[0]) {
    const d = byPrimary.docs[0];
    return NextResponse.json({ id: d.id, ...(d.data() as any) });
  }
  const byDomains = await adminDb.collection("stores").where("domains", "array-contains", slug).limit(1).get();
  if (byDomains.docs[0]) {
    const d = byDomains.docs[0];
    return NextResponse.json({ id: d.id, ...(d.data() as any) });
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
