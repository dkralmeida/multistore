import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase() || "";
  const res = NextResponse.next();
  res.headers.set("x-tenant-host", host);
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
