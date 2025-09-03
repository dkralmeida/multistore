"use client";
// ...existing code...
import { db, auth } from "@/lib/firebaseClient";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
// Removed duplicate imports
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function StoresAdmin() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);
  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [domains, setDomains] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const snap = await getDocs(collection(db, "stores"));
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  const createStore = async () => {
    const doc = {
      name,
      primaryDomain,
      domains: domains ? domains.split(",").map((d) => d.trim()).filter(Boolean) : [], // domínios alternativos
      theme: { logoUrl },
      status: "active"
    };
    await addDoc(collection(db, "stores"), doc);
    alert("Loja criada! Adicione este domínio na Vercel também.");
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto container-px py-10">
        <h1 className="text-2xl font-bold">Lojas</h1>
        <div className="mt-6 border rounded-lg p-4 grid gap-3">
          <button onClick={login} className="h-10 rounded bg-blue-600 text-white">Entrar com Google</button>
          <p className="text-sm text-neutral-500">Faça login para acessar o cadastro de lojas.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto container-px py-10">
      <h1 className="text-2xl font-bold">Lojas</h1>
      <div className="mt-6 border rounded-lg p-4 grid gap-3">
        <h2 className="font-semibold">Nova loja</h2>
        <input className="border rounded px-3 h-10" placeholder="Nome" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="border rounded px-3 h-10" placeholder="Domínio principal (ex: petfeliz.com.br)" value={primaryDomain} onChange={(e)=>setPrimaryDomain(e.target.value)} />
        <input className="border rounded px-3 h-10" placeholder="Domínios (separe por vírgula)" value={domains} onChange={(e)=>setDomains(e.target.value)} />
        <input className="border rounded px-3 h-10" placeholder="Logo URL (opcional)" value={logoUrl} onChange={(e)=>setLogoUrl(e.target.value)} />
        <button onClick={createStore} className="h-10 rounded bg-neutral-900 text-white">Criar loja</button>
        <p className="text-xs text-neutral-500">Não esqueça de adicionar os domínios no projeto da Vercel.</p>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold mb-2">Lojas existentes</h2>
        <ul className="grid gap-2">
          {items.map((s) => (
            <li key={s.id} className="border rounded px-3 py-2">
              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-neutral-600">{s.primaryDomain}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
