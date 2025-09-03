import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers";
import { getStoreByHost } from "@/server/tenants";
import Navbar from "@/ui/Navbar";
import Hero from "@/ui/Hero";

export const metadata: Metadata = {
  title: "Multistore",
  description: "Loja de afiliados multi-tenant",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const host = headers().get("x-tenant-host") ?? "";
  let store = null;
  try {
    store = await getStoreByHost(host);
  } catch (e) {
    // Fallback simples: página neutra
    store = { id: "default", name: "Loja", primaryDomain: host, domains: [host] };
  }

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Navbar store={store} />
  <Hero store={store} />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} {store?.name ?? "Loja"} — Vitrine de Afiliados
        </footer>
      </body>
    </html>
  );
}
