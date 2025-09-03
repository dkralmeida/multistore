// src/lib/firebaseAdmin.ts
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Garantir que só carrega no server
if (typeof window !== "undefined") {
  throw new Error("[firebaseAdmin] Não pode ser importado no client.");
}

let app: App;

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "[firebaseAdmin] Variáveis ausentes: verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY."
    );
  }

  // Corrige \n escapado
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  // Remove aspas acidentais no início/fim
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }

  return { projectId, clientEmail, privateKey };
}

if (!getApps().length) {
  const sa = getServiceAccount();
  app = initializeApp({
    credential: cert({
      projectId: sa.projectId,
      clientEmail: sa.clientEmail,
      privateKey: sa.privateKey,
    }),
    storageBucket: "multi-store-ab393.appspot.com",
    
  });
} else {
  app = getApps()[0]!;
}

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
