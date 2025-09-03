"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function Hero({ store: storeProp }: { store?: any }) {
  const pathname = usePathname();
  const [store, setStore] = useState<any>(storeProp ?? null);

  useEffect(() => {
    if (storeProp) setStore(storeProp);
  }, [storeProp]);

  useEffect(() => {
    const parts = (pathname || "").split("/").filter(Boolean);

    // admin area: prefer selectedStore
    if (parts[0] === "admin") {
      try {
        const raw = localStorage.getItem("selectedStore");
        if (raw) setStore(JSON.parse(raw));
      } catch (e) {}
      return;
    }

    if (parts[0]) {
      const slug = parts[0];
      (async () => {
        try {
          const res = await fetch(`/api/store?slug=${encodeURIComponent(slug)}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data && !data.error) setStore(data);
        } catch (e) {}
      })();
    }
  }, [pathname, storeProp]);

  return (
    <div className="max-w-6xl mx-auto container-px py-10">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Novidades em destaque</h1>
      <p className="text-neutral-600 mt-1">Vitrine da {store?.name ?? "Loja"}</p>
    </div>
  );
}

export default Hero;
