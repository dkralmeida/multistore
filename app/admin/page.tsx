"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export default function AdminHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto container-px py-10">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-neutral-600 mt-1">Faça login para acessar o painel administrativo.</p>
        <div className="mt-6 border rounded-lg p-4 grid gap-3">
          <button onClick={login} className="h-10 rounded bg-blue-600 text-white">Entrar com Google</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto container-px py-10">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-neutral-600 mt-1">Gerencie suas lojas, categorias e produtos.</p>
      <button onClick={() => signOut(auth)} className="h-10 rounded bg-red-600 text-white mb-6">Sair</button>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/stores" className="border rounded-lg p-4 hover:bg-neutral-50">
          <h2 className="font-semibold">Lojas</h2>
          <p className="text-sm text-neutral-600">Domínios, logo, tema</p>
        </Link>
        <Link href="/admin/categories" className="border rounded-lg p-4 hover:bg-neutral-50">
          <h2 className="font-semibold">Categorias</h2>
          <p className="text-sm text-neutral-600">Hierarquia por loja</p>
        </Link>
        <Link href="/admin/products" className="border rounded-lg p-4 hover:bg-neutral-50">
          <h2 className="font-semibold">Produtos</h2>
          <p className="text-sm text-neutral-600">Vitrine com links de afiliado</p>
        </Link>
      </div>
    </div>
  );
}
