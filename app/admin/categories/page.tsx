"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function CategoriesAdmin() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(collection(db, "stores"));
  setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  const createCategory = async () => {
    if (!storeId) return alert("Selecione uma loja");
    await addDoc(collection(db, "categories"), { storeId, name, slug, order: 0 });
    alert("Categoria criada!");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto container-px py-10">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="mt-6">Carregando...</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto container-px py-10">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <div className="mt-6 border rounded-lg p-4 grid gap-3">
          <button onClick={login} className="h-10 rounded bg-blue-600 text-white">Entrar com Google</button>
          <p className="text-sm text-neutral-500">Faça login para acessar o cadastro de categorias.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto container-px py-10">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <button onClick={() => signOut(auth)} className="h-10 rounded bg-red-600 text-white mb-6">Sair</button>
      <div className="mt-6 border rounded-lg p-4 grid gap-3">
        <select className="border rounded px-3 h-10" value={storeId} onChange={(e)=>setStoreId(e.target.value)}>
          <option value="">Selecione a loja</option>
          {items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="border rounded px-3 h-10" placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="border rounded px-3 h-10" placeholder="slug (ex: camisas-fitness)" value={slug} onChange={(e)=>setSlug(e.target.value)} />
        <button onClick={createCategory} className="h-10 rounded bg-neutral-900 text-white">Criar categoria</button>
      </div>
    </div>
  );
}
