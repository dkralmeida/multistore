"use client";
import { useEffect, useState } from "react";
import { db, storage, auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProductsAdmin() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [storeId, setStoreId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [catIds, setCatIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const s = await getDocs(collection(db, "stores"));
      setStores(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  // persist selected store for Navbar in admin area
  useEffect(() => {
    if (storeId) {
      const s = stores.find((x) => x.id === storeId);
      if (s) {
        try {
          localStorage.setItem("selectedStore", JSON.stringify(s));
        } catch (e) {}
      }
    }
  }, [storeId, stores]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      if (!storeId) return setCategories([]);
      const c = await getDocs(collection(db, "categories"));
      const list = c.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(list.filter((i: any) => i.storeId === storeId));
    })();
  }, [storeId, user]);

  const toggleCat = (id: string) => {
    setCatIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const createProduct = async () => {
    if (!storeId) return alert("Selecione uma loja");
    if (!title || !slug || !affiliateUrl) return alert("Preencha título, slug e link afiliado");
    if (!imageUrl) return alert("Informe a URL da imagem");
    await addDoc(collection(db, "products"), {
      storeId,
      title,
      slug,
      images: [imageUrl],
      excerpt,
      specs: {},
      priceVisible: false,
      affiliate: { network: "partner", url: affiliateUrl },
      categoryIds: catIds,
      status: "active",
    });
    alert("Produto criado!");
    setTitle(""); setSlug(""); setExcerpt(""); setAffiliateUrl(""); setImageUrl(""); setCatIds([]);
  };

  return (
    <div className="max-w-4xl mx-auto container-px py-10">
      <h1 className="text-2xl font-bold">Produtos</h1>
      {!user && (
        <div className="mt-6 border rounded-lg p-4 grid gap-3">
          <button onClick={login} className="h-10 rounded bg-blue-600 text-white">Entrar com Google</button>
          <p className="text-sm text-neutral-500">Faça login para cadastrar produtos.</p>
        </div>
      )}
      {user && (
        <div className="mt-6 border rounded-lg p-4 grid gap-3">
          <select className="border rounded px-3 h-10" value={storeId} onChange={(e)=>setStoreId(e.target.value)}>
            <option value="">Selecione a loja</option>
            {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="border rounded px-3 h-10" placeholder="Título" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <input className="border rounded px-3 h-10" placeholder="slug (ex: camisa-fitness-pro)" value={slug} onChange={(e)=>setSlug(e.target.value)} />
          </div>
          <textarea className="border rounded p-3" rows={3} placeholder="Descrição curta" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} />
          <input className="border rounded px-3 h-10" placeholder="Link de afiliado (Amazon/Magalu/etc.)" value={affiliateUrl} onChange={(e)=>setAffiliateUrl(e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1">Categorias</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCat(c.id)}
                  className={"px-3 h-9 rounded border " + (catIds.includes(c.id) ? "bg-neutral-900 text-white" : "bg-white")}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL da imagem</label>
            <input
              className="border rounded px-3 h-10"
              placeholder="Cole aqui a URL da imagem (ex: https://imgur.com/xyz.png)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {imageUrl && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                <img src={imageUrl} alt="Pré-visualização" className="w-full h-24 object-cover rounded border" />
              </div>
            )}
          </div>
          <button onClick={createProduct} className="h-10 rounded bg-neutral-900 text-white">Salvar produto</button>
        </div>
      )}
    </div>
  );
}

