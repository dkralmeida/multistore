"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isValidLogo(src: any) {
  if (!src || typeof src !== "string") return false;
  const s = src.trim();
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/") || s.startsWith("data:");
}

export default function Navbar({ store: storeProp }: { store: any }) {
  const pathname = usePathname();
  const [store, setStore] = useState<any>(storeProp ?? null);

  // keep prop changes
  useEffect(() => {
    if (storeProp) setStore(storeProp);
  }, [storeProp]);

  useEffect(() => {
    const parts = (pathname || "").split("/").filter(Boolean);

    // admin area: prefer selectedStore from localStorage (override server prop)
    if (parts[0] === "admin") {
      try {
        const raw = localStorage.getItem("selectedStore");
        if (raw) setStore(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
      return;
    }

    // if first segment exists, always try fetch store by slug (override server prop when found)
    if (parts[0]) {
      const slug = parts[0];
      const doFetch = async (attempt = 1) => {
        try {
          console.debug(`[Navbar] fetching store for slug=${slug} attempt=${attempt}`);
          const res = await fetch(`/api/store?slug=${encodeURIComponent(slug)}`);
          if (!res.ok) {
            console.warn(`[Navbar] /api/store responded ${res.status}`);
            if (attempt < 2) return doFetch(attempt + 1);
            return;
          }
          const data = await res.json();
          console.debug('[Navbar] fetched store data', data);
          if (data && !data.error) {
            // override whatever store we had from server
            setStore(data);
          }
        } catch (err) {
          console.error('[Navbar] fetch error', err);
          if (attempt < 2) return doFetch(attempt + 1);
        }
      };
      doFetch();
    }
  }, [pathname, storeProp]);

  const logo = store?.theme?.logoUrl;
  const hasValidLogo = isValidLogo(logo);

  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto container-px h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasValidLogo ? (
            // usar <img> direto evita restrições do next/image com domínios
            <img src={logo} alt={store?.name ?? 'logo'} width={36} height={36} className="rounded object-cover w-9 h-9" />
          ) : (
            <div className="w-9 h-9 rounded bg-neutral-900" />
          )}
          <Link href="/" className="font-semibold tracking-tight text-lg">
            {store?.name ?? "Loja"}
          </Link>
        </div>
        <nav className="text-sm flex items-center gap-4 text-neutral-700">
          <Link href="/">Home</Link>
          <Link href="/categoria/todos">Categorias</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
